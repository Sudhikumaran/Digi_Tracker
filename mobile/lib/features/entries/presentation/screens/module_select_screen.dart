import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../services/api_service.dart';
import '../../../../shared/widgets/loading_skeleton.dart';
import '../../../../shared/widgets/module_logo.dart';
import '../../../../shared/widgets/ui_components.dart';
import '../../../../core/config/theme/app_theme.dart';

class ModuleSelectScreen extends StatefulWidget {
  const ModuleSelectScreen({super.key});

  @override
  State<ModuleSelectScreen> createState() => _ModuleSelectScreenState();
}

class _ModuleSelectScreenState extends State<ModuleSelectScreen> {
  List<dynamic> _modules = [];
  bool _loading = true;

  Future<void> _load() async {
    final mods = await ApiService().getModules();
    setState(() {
      _modules = mods;
      _loading = false;
    });
  }

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Module'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Divider(height: 1, color: Theme.of(context).dividerColor),
        ),
      ),
      body: _loading
          ? ListView.builder(
              padding: const EdgeInsets.all(AppSpacing.md),
              itemCount: 4,
              itemBuilder: (_, __) => const Padding(
                padding: EdgeInsets.only(bottom: AppSpacing.sm),
                child: LoadingSkeleton(height: 140),
              ),
            )
          : RefreshIndicator(
              onRefresh: _load,
              child: GridView.builder(
              padding: const EdgeInsets.all(AppSpacing.md),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.88,
              ),
              itemCount: _modules.length,
              itemBuilder: (context, index) {
                final mod = _modules[index];
                final brand = moduleBrandFor(mod['slug'], mod['icon'], mod['color']);

                return AppCard(
                  onTap: () => context.push('/entries/${mod['_id']}'),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      ModuleLogo(
                        slug: mod['slug'],
                        iconName: mod['icon'],
                        hexColor: mod['color'],
                        size: 48,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        mod['name'],
                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: brand.color.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '${mod['fields']?.length ?? 0} fields',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: brand.color),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
            ),
    );
  }
}
