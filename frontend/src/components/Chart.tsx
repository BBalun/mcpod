import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import Plot from "react-plotly.js";
import { System } from "../types/systems";
import { findFilterUsingCode } from "../utils/system";
import Plotly from "plotly.js-dist-min";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useRef } from "react";

interface ChartProps {
  mainId: string;
  systems: System[];
  data: Record<string, Array<{ julianDate: number; magnitude: number }>>;
}

const DataChart = ({ data, systems, mainId }: ChartProps) => {
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
      // TODO:
    }
  };

  return (
    <div className="w-full flex-col">
      <div className="flex w-full justify-center">
        <Plot
          ref={ref}
          data={Object.entries(data).map(([filter, filterData]) => ({
            x: filterData.map((a) => a.julianDate),
            y: filterData.map((a) => a.magnitude),
            mode: "markers",
            type: "scattergl",
            name: findFilterUsingCode(filter, systems)?.name ?? "unknown",
          }))}
          layout={{
            title: `mcPod data for start ${mainId}`,
            xaxis: {
              title: {
                text: "HJD - 2400000",
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
            responsive: true,
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
              {/* <MenuItem onClick={}>Download as TXT</MenuItem> */}
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

export default DataChart;
