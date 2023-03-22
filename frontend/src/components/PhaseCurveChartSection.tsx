import { Button, Input } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { trpc } from "../utils/trpc";
import PhaseChart from "./PhaseCurveChart";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { System } from "../types/systems";

interface PhaseChartProps {
  starId: string;
  initialEphemerids: {
    period: number | null;
    epoch: number | null;
  };
  filters: string[];
  startDate?: number;
  endDate?: number;
  referenceIds?: string[];
  allIdentifiers: string[];
  initialData: Record<
    string,
    Array<{ phase: number; magnitude: number }>
  > | null;
  systems: System[];
}

const schema = z.object({
  epoch: z.coerce
    .string()
    .trim()
    .min(1, "Phase is required")
    .transform(Number)
    .pipe(
      z
        .number({
          errorMap: () => ({ message: "Phase must be a number" }),
        })
        .nonnegative("Phase must be positive")
    ),
  period: z.coerce
    .string()
    .trim()
    .min(1, "Period is required")
    .transform(Number)
    .pipe(
      z
        .number({
          errorMap: () => ({ message: "Period must be a number" }),
        })
        .nonnegative("Period must be positive")
    ),
});

type FormValues = z.infer<typeof schema>;

const PhaseCurveChartSection = (props: PhaseChartProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      period: props.initialEphemerids.period ?? undefined,
      epoch: props.initialEphemerids.epoch ?? undefined,
    },
  });

  const { client } = trpc.useContext();
  const { mutate, isLoading, error, data } = useMutation(
    ["phaseCurveData"],
    client.getPhasedData.query
  );

  function submit(values: FormValues) {
    mutate({
      epoch: values.epoch,
      period: values.period,
      starIds: props.allIdentifiers,
      filters: props.filters,
      startDate: props.startDate,
      endDate: props.endDate,
      referenceIds: props.referenceIds,
    });
  }

  if (isLoading) {
    // TODO: show loading spinner
    return <div>Loading...</div>;
  }

  if (error) {
    console.error(error);
    return <div>Failed to fetch phase and epoch for star {props.starId}</div>;
  }

  const chartData = data ?? props.initialData;

  return (
    <>
      <form
        onSubmit={handleSubmit(submit)}
        className="mb-2 flex w-full flex-col items-end justify-center"
      >
        <div>
          <div className="my-2 grid w-fit grid-cols-2 gap-2">
            <label htmlFor="phaseInput">Epoch:</label>
            <div>
              <Input id="phaseInput" className="!w-40" {...register("epoch")} />
              <p className="text-red-500">{errors.epoch?.message}</p>
            </div>
            <label htmlFor="periodInput">Period (in days):</label>
            <div>
              <Input
                id="periodInput"
                className="!w-40"
                {...register("period")}
              />
              <p className="text-red-500">{errors.period?.message}</p>
            </div>
          </div>
          <Button type="submit" colorScheme="gray" variant="solid" width="full">
            Submit
          </Button>
        </div>
      </form>
      {chartData && (
        <PhaseChart
          starId={props.starId}
          systems={props.systems}
          data={chartData}
        />
      )}
    </>
  );
};

export default PhaseCurveChartSection;
