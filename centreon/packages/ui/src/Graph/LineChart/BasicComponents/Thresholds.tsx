import { always, cond, equals, isNil } from 'ramda';

import { Theme, useTheme } from '@mui/material';

import { getUnits, getYScale } from '../../common/timeSeries';
import { Line } from '../../common/timeSeries/models';

interface Props {
  displayedLines: Array<Line>;
  hideTooltip: () => void;
  leftScale: (value: number) => number;
  rightScale: (value: number) => number;
  showTooltip: (props) => void;
  thresholdLabels?: Array<string>;
  thresholdUnit?: string;
  thresholds?: Array<number>;
  width: number;
  isLowThresholds?: boolean;
}

interface GetColorProps {
  index: number;
  theme: Theme;
  isLowThresholds?: boolean;
}

const getColor = ({ index, theme, isLowThresholds }: GetColorProps): string => {
  const firstLineColor = isLowThresholds
    ? theme.palette.error.main
    : theme.palette.warning.main;
  const secondLineColor = isLowThresholds
    ? theme.palette.warning.main
    : theme.palette.error.main;

  return cond([
    [equals(0), always(firstLineColor)],
    [equals(1), always(secondLineColor)]
  ])(index);
};

const Thresholds = ({
  thresholds,
  leftScale,
  rightScale,
  width,
  displayedLines,
  thresholdUnit,
  showTooltip,
  hideTooltip,
  thresholdLabels,
  isLowThresholds
}: Props): JSX.Element | null => {
  const theme = useTheme();

  if (!thresholds) {
    return null;
  }

  const [firstUnit, secondUnit, thirdUnit] = getUnits(
    displayedLines as Array<Line>
  );

  const shouldUseRightScale = equals(thresholdUnit, secondUnit);

  const yScale = shouldUseRightScale
    ? rightScale
    : getYScale({
        hasMoreThanTwoUnits: !isNil(thirdUnit),
        invert: null,
        leftScale,
        rightScale,
        secondUnit,
        unit: firstUnit
      });

  const thresholdScaledValues = thresholds
    .sort()
    .map((threshold) => yScale(threshold));

  return (
    <>
      {thresholdScaledValues.map((threshold, index) => {
        return (
          <line
            data-testid={`threshold-${threshold}`}
            key={`threshold-${thresholdLabels?.[index]}-${threshold}`}
            stroke={getColor({
              index,
              theme,
              isLowThresholds
            })}
            strokeDasharray="5,5"
            strokeWidth={2}
            x1={0}
            x2={width}
            y1={threshold}
            y2={threshold}
          />
        );
      })}
      {thresholdScaledValues.map((threshold, index) => {
        return (
          <line
            data-testid={`threshold-${threshold}-tooltip`}
            key={`threshold-${thresholdLabels?.[index]}-${threshold}-tooltip`}
            stroke="transparent"
            strokeWidth={4}
            x1={0}
            x2={width}
            y1={threshold}
            y2={threshold}
            onMouseEnter={(): void => {
              if (!thresholdLabels?.[index]) {
                return;
              }
              showTooltip({
                tooltipData: thresholdLabels?.[index],
                tooltipLeft: 0,
                tooltipTop: threshold
              });
            }}
            onMouseLeave={hideTooltip}
          />
        );
      })}
    </>
  );
};

export default Thresholds;
