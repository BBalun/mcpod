import { useRef } from "react";
import Plot from "react-plotly.js";
import { System } from "../types/systems";
import { findFilterUsingCode } from "../utils/system";
import Plotly from "plotly.js-dist-min";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { Menu, MenuButton, Button, MenuList, MenuItem } from "@chakra-ui/react";
import papaparse from "papaparse";
import { saveAs } from "file-saver";

export interface PhaseCurveChartProps {
  mainId: string;
  systems: System[];
  data: Record<
    string,
    Array<{
      magnitude: number;
      phase: number;
      filter: string;
      magErr?: number;
      referenceId: string;
    }>
  >;
}

const PhaseCurveChart = ({ data, systems, mainId }: PhaseCurveChartProps) => {
  const ref = useRef<any>();

  const download = async (format: "svg" | "png" | "csv") => {
    if (format !== "csv") {
      await Plotly.downloadImage(ref.current.el, {
        format,
        filename: mainId,
        width: 1000,
        height: 750,
      });
    } else {
      const [minPhase, maxPhase] = ref.current.el.layout.xaxis.range;
      const [maxMag, minMag] = ref.current.el.layout.yaxis.range; // y axis is reversed

      const visibleData = Object.values(data)
        .flatMap((data) => data)
        .filter(
          (data) =>
            data.phase >= minPhase &&
            data.phase <= maxPhase &&
            data.magnitude >= minMag &&
            data.magnitude <= maxMag
        )
        .map((data) => ({ ...data, star: mainId }));

      const csv = papaparse.unparse(visibleData, {
        header: true,
        delimiter: ",",
        columns: [
          "star",
          "referenceId",
          "phase",
          "filter",
          "magnitude",
          "magErr",
        ],
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      saveAs(blob, `${mainId}.csv`);
    }
  };

  return (
    <div className="w-full flex-col">
      <div className="flex w-full justify-center">
        <Plot
          ref={ref}
          data={Object.entries(data).map(([filter, filterData]) => ({
            x: filterData.map((a) => a.phase),
            y: filterData.map((a) => a.magnitude),
            mode: "markers",
            type: "scattergl",
            name: findFilterUsingCode(filter, systems)?.name ?? "unknown",
          }))}
          layout={{
            title: `mcPod phased light curve of start ${mainId}`,
            xaxis: {
              title: {
                text: "Phase",
              },
            },
            yaxis: {
              title: {
                text: "Mag",
              },
              autorange: "reversed",
            },
            dragmode: "pan",
            hovermode: "closest",
            modebar: {
              orientation: "h",
            },
            width: 700,
            height: 700,
            margin: {
              t: 80,
              l: 60,
              r: 60,
            },
          }}
          config={{
            displaylogo: false,
            responsive: false,
            scrollZoom: true,
            modeBarButtonsToRemove: ["lasso2d", "select2d", "toImage"],
            displayModeBar: true,
          }}
        />
      </div>
      <div className="flex w-full flex-row justify-end gap-5">
        <div className="w-3/12">
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              w={"full"}
              className="mb-10 mt-2"
            >
              Download
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => download("csv")}>
                Download as CSV
              </MenuItem>
              <MenuItem onClick={() => download("png")}>
                Download as PNG
              </MenuItem>
              <MenuItem onClick={() => download("svg")}>
                Download as SVG
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default PhaseCurveChart;
