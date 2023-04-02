import { Button, Checkbox } from "@chakra-ui/react";
import { System } from "../types/systems";
import { parsePseudoHtml } from "../utils/parse";

interface FiltersProps {
  systems: System[];
  filters: string[];
  setFilters: (filters: string[]) => void;
}

export default function Filters({
  systems,
  filters,
  setFilters,
}: FiltersProps) {
  return (
    <section className="flex w-full flex-col gap-2">
      {systems.map((system) => {
        const isChecked = system.filters.every((f) => filters.includes(f.code));
        const isIndeterminate =
          !isChecked && system.filters.some((f) => filters.includes(f.code));
        return (
          <div key={system.name}>
            <div className="flex gap-2">
              <Checkbox
                id={system.name}
                isChecked={isChecked}
                isIndeterminate={isIndeterminate}
                onChange={(e) =>
                  e.target.checked
                    ? setFilters([
                        ...filters,
                        ...system.filters.map((f) => f.code),
                      ])
                    : setFilters(
                        filters.filter(
                          (f) => !system.filters.map((f) => f.code).includes(f)
                        )
                      )
                }
              />
              <label htmlFor={system.name}>
                {system.displayName || system.name}:
              </label>
            </div>
            <div className="ml-4 flex flex-row flex-wrap gap-4 gap-y-2">
              {system.filters.map((filter) => (
                <div className="flex gap-1" key={filter.code}>
                  <Checkbox
                    value={filter.code}
                    isChecked={filters.includes(filter.code)}
                    onChange={(e) => {
                      setFilters(
                        e.target.checked
                          ? [...filters, filter.code]
                          : filters.filter((f) => f !== filter.code)
                      );
                    }}
                  />
                  <label
                    htmlFor={filter.code}
                    dangerouslySetInnerHTML={{
                      __html: parsePseudoHtml(filter.displayName),
                    }}
                  ></label>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <Button
        colorScheme="facebook"
        className="mt-1"
        onClick={() => setFilters([])}
      >
        Clear all filters
      </Button>
    </section>
  );
}
