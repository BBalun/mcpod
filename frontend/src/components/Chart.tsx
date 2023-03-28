import { forwardRef } from "react";
import { Scatter } from "react-chartjs-2";
import { System } from "../types/systems";
import { findFilterUsingCode } from "../utils/system";

interface ChartProps {
  mainId: string;
  systems: System[];
  data: Record<string, Array<{ julianDate: number; magnitude: number }>>;
}

const DataChart = ({ data, systems, mainId }: ChartProps, ref: any) => {
  return (
    <Scatter
      ref={ref}
      data={{
        datasets: Object.entries(data).map(([filter, filterData]) => ({
          label: findFilterUsingCode(filter, systems)?.name ?? "unknown",
          data: filterData.map((a) => ({
            x: Number(a.julianDate),
            y: Number(a.magnitude),
          })),
        })),
        // [
        // {
        //   data: data
        //     .filter((x) => x.magnitude != null)
        //     .map((a) => ({
        //       x: Number(a.julianDate),
        //       y: Number(a.magnitude!),
        //     })),
        //   label: findFilterUsingCode(data[0].filter)!.name,
        // },
        // ],
      }}
      options={{
        animation: false,
        plugins: {
          title: {
            display: true,
            text: `mcPod data for start ${mainId}`,
          },
          zoom: {
            pan: {
              enabled: true,
              mode: "xy",
            },
            zoom: {
              wheel: {
                enabled: true,
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "HJD - 2400000",
            },
          },
          y: {
            title: {
              display: true,
              text: "Mag",
            },
            reverse: true,
          },
        },
      }}
    />
  );
};

export default forwardRef(DataChart);
