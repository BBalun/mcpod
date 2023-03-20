import { Scatter } from "react-chartjs-2";
import { System } from "../types/systems";
import { findFilterUsingCode } from "../utils/system";

export interface PhaseCurveChartProps {
  hdNumber: number;
  systems: System[];
  data: Record<string, Array<{ magnitude: string; phase: number }>>;
}

const PhaseCurveChart = ({ data, systems, hdNumber }: PhaseCurveChartProps) => {
  return (
    <Scatter
      data={{
        datasets: Object.entries(data).map(([filter, filterData]) => ({
          label: findFilterUsingCode(filter, systems)?.name ?? "unknown",
          data: filterData.map((a) => ({
            x: a.phase,
            y: Number(a.magnitude),
          })),
        })),
      }}
      options={{
        plugins: {
          title: {
            display: true,
            text: `mcPod phased light curve of start HD ${hdNumber}`,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Phase",
            },
          },
          y: {
            title: {
              display: true,
              text: "Magnitude",
            },
            reverse: true,
          },
        },
      }}
    />
  );
};

export default PhaseCurveChart;
