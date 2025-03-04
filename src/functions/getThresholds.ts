interface GetThresholdsArgs {
	dimension: number;
	minMergeThresholdRatio: number;
	maxMergeThresholdRatio: number;
	marginThresholdRatio: number;
	minWidthThresholdRatio: number;
	minHeightThresholdRatio: number;
	maxWidthThresholdRatio: number;
	maxHeightThresholdRatio: number;
}

/**
 * Calculates various threshold values based on the provided dimension and ratio arguments.
 *
 * @internal
 * @param {Object} args - The arguments object.
 * @param {number} args.dimension - The base dimension to calculate thresholds from.
 * @param {number} args.minMergeThresholdRatio - The ratio to calculate the minimum merge threshold.
 * @param {number} args.maxMergeThresholdRatio - The ratio to calculate the maximum merge threshold.
 * @param {number} args.marginThresholdRatio - The ratio to calculate the margin threshold.
 * @param {number} args.minWidthThresholdRatio - The ratio to calculate the minimum width threshold.
 * @param {number} args.minHeightThresholdRatio - The ratio to calculate the minimum height threshold.
 * @param {number} args.maxWidthThresholdRatio - The ratio to calculate the maximum width threshold.
 * @param {number} args.maxHeightThresholdRatio - The ratio to calculate the maximum height threshold.
 *
 * @returns {Object} An object containing the calculated threshold values.
 * @returns {number} return.marginThreshold - The calculated margin threshold.
 * @returns {number} return.minMergeThreshold - The calculated minimum merge threshold.
 * @returns {number} return.maxMergeThreshold - The calculated maximum merge threshold.
 * @returns {number} return.minWidth - The calculated minimum width threshold.
 * @returns {number} return.minHeight - The calculated minimum height threshold.
 * @returns {number} return.maxWidth - The calculated maximum width threshold.
 * @returns {number} return.maxHeight - The calculated maximum height threshold.
 */
export const getThresholds = ({
	dimension,
	minMergeThresholdRatio,
	maxMergeThresholdRatio,
	marginThresholdRatio,
	minWidthThresholdRatio,
	minHeightThresholdRatio,
	maxWidthThresholdRatio,
	maxHeightThresholdRatio,
}: GetThresholdsArgs) => {
	const marginThreshold = Math.floor(Math.max(dimension * marginThresholdRatio, 1));
	const minMergeThreshold = Math.floor(Math.max(dimension * minMergeThresholdRatio, 1));
	const maxMergeThreshold = Math.floor(Math.max(dimension * maxMergeThresholdRatio, 1));
	const minWidth = Math.floor(Math.max(dimension * minWidthThresholdRatio, 1));
	const minHeight = Math.floor(Math.max(dimension * minHeightThresholdRatio, 1));
	const maxWidth = Math.floor(Math.max(dimension * maxWidthThresholdRatio, 1));
	const maxHeight = Math.floor(Math.max(dimension * maxHeightThresholdRatio, 1));
	return {
		marginThreshold,
		minMergeThreshold,
		maxMergeThreshold,
		minWidth,
		minHeight,
		maxWidth,
		maxHeight,
	};
};
