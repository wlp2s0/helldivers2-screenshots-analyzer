export const getThresholds = ({
    dimension,
    minMergeThresholdRatio,
    maxMergeThresholdRatio,
    marginThresholdRatio,
    minWidthThresholdRatio,
    minHeightThresholdRatio,
    maxWidthThresholdRatio,
    maxHeightThresholdRatio
}) => {
    const marginThreshold = Math.floor(Math.max(dimension * marginThresholdRatio, 1));
    const minMergeThreshold = Math.floor(Math.max(dimension * minMergeThresholdRatio, 1));
    const maxMergeThreshold = Math.floor(Math.max(dimension * maxMergeThresholdRatio, 1));
    const minWidth = Math.floor(Math.max(dimension * minWidthThresholdRatio, 1));
    const minHeight = Math.floor(Math.max(dimension * minHeightThresholdRatio, 1));
    const maxWidth = Math.floor(Math.max(dimension * maxWidthThresholdRatio, 1));
    const maxHeight = Math.floor(Math.max(dimension * maxHeightThresholdRatio, 1));
    return { marginThreshold, minMergeThreshold, maxMergeThreshold, minWidth, minHeight, maxWidth, maxHeight };
}
