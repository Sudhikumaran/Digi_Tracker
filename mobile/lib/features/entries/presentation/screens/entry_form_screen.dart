import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../../services/api_service.dart';
import '../../../../services/draft_service.dart';
import '../../../../shared/widgets/module_logo.dart';
import '../../../../shared/widgets/ui_components.dart';
import '../../../../core/config/theme/app_theme.dart';
import '../../../../core/utils/api_error.dart';

class EntryFormScreen extends StatefulWidget {
  final String moduleId;
  final String? entryId;

  const EntryFormScreen({super.key, required this.moduleId, this.entryId});

  @override
  State<EntryFormScreen> createState() => _EntryFormScreenState();
}

class _EntryFormScreenState extends State<EntryFormScreen> {
  Map<String, dynamic>? _module;
  Map<String, dynamic>? _existingEntry;
  final _controllers = <String, TextEditingController>{};
  final _boolValues = <String, bool>{};
  DateTime _selectedDate = DateTime.now();
  final _notesController = TextEditingController();
  bool _loading = true;
  bool _submitting = false;
  bool _isEdit = false;

  @override
  void initState() {
    super.initState();
    _loadModule();
  }

  Future<void> _loadModule() async {
    final api = ApiService();
    final modules = await api.getModules();
    final mod = modules.firstWhere((m) => m['_id'] == widget.moduleId);

    if (widget.entryId != null) {
      _existingEntry = await api.getEntry(widget.entryId!);
      _isEdit = true;
      _selectedDate = DateTime.parse(_existingEntry!['entryDate']);
      _notesController.text = _existingEntry!['notes']?.toString() ?? '';
    }

    for (final field in mod['fields'] as List) {
      if (field['isActive'] != false) {
        _controllers[field['slug']] = TextEditingController();
        if (field['type'] == 'boolean') _boolValues[field['slug']] = false;
      }
    }

    if (_existingEntry != null) {
      for (final val in _existingEntry!['values'] as List) {
        final slug = val['fieldSlug'] as String;
        final value = val['value'];
        if (_boolValues.containsKey(slug)) {
          _boolValues[slug] = value == true;
        } else if (_controllers.containsKey(slug)) {
          _controllers[slug]?.text = value?.toString() ?? '';
        }
      }
    } else {
      final draft = await DraftService().loadDraft(widget.moduleId);
      if (draft != null) {
        _notesController.text = draft['notes']?.toString() ?? '';
        if (draft['entryDate'] != null) {
          _selectedDate = DateTime.parse(draft['entryDate']);
        }
        for (final val in (draft['values'] as List?) ?? []) {
          final slug = val['fieldSlug'] as String;
          if (_boolValues.containsKey(slug)) {
            _boolValues[slug] = val['value'] == true;
          } else if (_controllers.containsKey(slug)) {
            _controllers[slug]?.text = val['value']?.toString() ?? '';
          }
        }
      }
    }

    setState(() {
      _module = mod;
      _loading = false;
    });
  }

  Future<void> _saveDraft() async {
    if (_isEdit || _module == null) return;
    final values = _collectValues();
    await DraftService().saveDraft(widget.moduleId, {
      'entryDate': _selectedDate.toIso8601String(),
      'values': values,
      'notes': _notesController.text,
    });
  }

  List<Map<String, dynamic>> _collectValues() {
    final values = <Map<String, dynamic>>[];
    for (final field in _module!['fields'] as List) {
      if (field['isActive'] == false) continue;
      final slug = field['slug'] as String;
      dynamic value;
      if (field['type'] == 'boolean') {
        value = _boolValues[slug] ?? false;
      } else if (['number', 'currency', 'percentage'].contains(field['type'])) {
        value = double.tryParse(_controllers[slug]?.text ?? '') ?? 0;
      } else {
        value = _controllers[slug]?.text ?? '';
      }
      values.add({'fieldSlug': slug, 'value': value});
    }
    return values;
  }

  Future<void> _submit() async {
    if (_module == null) return;
    setState(() => _submitting = true);

    final values = _collectValues();
    final payload = {
      'moduleId': widget.moduleId,
      'entryDate': _selectedDate.toIso8601String(),
      'values': values,
      'notes': _notesController.text,
    };

    try {
      if (_isEdit && widget.entryId != null) {
        await ApiService().updateEntry(widget.entryId!, {
          'values': values,
          'notes': _notesController.text,
        });
      } else {
        await ApiService().createEntry(payload);
        await DraftService().clearDraft(widget.moduleId);
      }

      if (mounted) {
        context.go('/entry-success?module=${Uri.encodeComponent(_module!['name'])}&edit=$_isEdit');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(parseApiError(e)), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  void dispose() {
    for (final c in _controllers.values) {
      c.dispose();
    }
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(_isEdit ? 'Edit ${_module!['name']}' : '${_module!['name']} Entry'),
        actions: [
          if (!_isEdit)
            TextButton(
              onPressed: _saveDraft,
              child: const Text('Save Draft'),
            ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.md),
        children: [
          AppCard(
            child: Row(
              children: [
                ModuleLogo(
                  slug: _module!['slug'],
                  iconName: _module!['icon'],
                  hexColor: _module!['color'],
                  size: 48,
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_module!['name'], style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                      Text(
                        _isEdit ? 'Update today\'s metrics' : 'Fill in today\'s metrics',
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 13),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          AppCard(
            onTap: _isEdit ? null : () async {
              final date = await showDatePicker(
                context: context,
                initialDate: _selectedDate,
                firstDate: DateTime.now().subtract(const Duration(days: 7)),
                lastDate: DateTime.now(),
              );
              if (date != null) setState(() => _selectedDate = date);
            },
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.calendar_today_rounded, color: AppColors.primary, size: 20),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Entry Date', style: TextStyle(fontWeight: FontWeight.w600)),
                      Text(
                        DateFormat('EEEE, MMMM d, yyyy').format(_selectedDate),
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 13),
                      ),
                    ],
                  ),
                ),
                if (!_isEdit) const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          const SectionTitle(title: 'Metrics'),
          const SizedBox(height: AppSpacing.sm),
          ...(_module!['fields'] as List).where((f) => f['isActive'] != false).map((field) {
            return Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.md),
              child: _buildField(field),
            );
          }),
          TextField(
            controller: _notesController,
            decoration: const InputDecoration(
              labelText: 'Notes (optional)',
              alignLabelWithHint: true,
            ),
            maxLines: 3,
          ),
          const SizedBox(height: AppSpacing.lg),
          SizedBox(
            height: 52,
            child: ElevatedButton(
              onPressed: _submitting ? null : _submit,
              child: _submitting
                  ? const SizedBox(
                      height: 22,
                      width: 22,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : Text(_isEdit ? 'Update Entry' : 'Submit Entry'),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
        ],
      ),
    );
  }

  Widget _buildField(Map<String, dynamic> field) {
    final slug = field['slug'] as String;
    final type = field['type'] as String;
    final required = field['required'] == true;
    final label = '${field['name']}${required ? ' *' : ''}';

    if (type == 'boolean') {
      return AppCard(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 0),
        child: SwitchListTile(
          title: Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
          value: _boolValues[slug] ?? false,
          activeThumbColor: AppColors.primary,
          onChanged: (v) => setState(() => _boolValues[slug] = v),
        ),
      );
    }

    if (type == 'dropdown') {
      final options = (field['options'] as List?)?.cast<String>() ?? [];
      return DropdownButtonFormField<String>(
        decoration: InputDecoration(labelText: label),
        items: options.map((o) => DropdownMenuItem(value: o, child: Text(o))).toList(),
        onChanged: (v) => _controllers[slug]?.text = v ?? '',
      );
    }

    return TextField(
      controller: _controllers[slug],
      decoration: InputDecoration(
        labelText: label,
        prefixText: type == 'currency' ? '\$ ' : type == 'percentage' ? '% ' : null,
      ),
      keyboardType: ['number', 'currency', 'percentage'].contains(type)
          ? const TextInputType.numberWithOptions(decimal: true)
          : TextInputType.text,
      inputFormatters: ['number', 'currency', 'percentage'].contains(type)
          ? [FilteringTextInputFormatter.allow(RegExp(r'[\d.]'))]
          : null,
    );
  }
}
