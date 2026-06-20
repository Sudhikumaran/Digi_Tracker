import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class LoadingSkeleton extends StatelessWidget {
  final double height;
  final double? width;

  const LoadingSkeleton({super.key, this.height = 80, this.width});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade300,
      highlightColor: Colors.grey.shade100,
      child: Container(
        height: height,
        width: width ?? double.infinity,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }
}

class KpiSkeletonGrid extends StatelessWidget {
  const KpiSkeletonGrid({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(2, (i) => Expanded(
        child: Padding(
          padding: EdgeInsets.only(left: i > 0 ? 8 : 0, right: i < 1 ? 8 : 0),
          child: const LoadingSkeleton(height: 90),
        ),
      )),
    );
  }
}
