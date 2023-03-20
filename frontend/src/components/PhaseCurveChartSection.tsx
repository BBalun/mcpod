import { Button, Input } from "@chakra-ui/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { System } from "../types/systems";
import { trpc } from "../utils/trpc";
import PhaseChart from "./PhaseCurveChart";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface PhaseChartProps {
  hdNumber: number;
  systems: System[];
  filters: string[];
  startDate?: number;
  endDate?: number;
  references?: string[];
}

type PhaseDataParamsType = {
  phase?: number;
  period?: number;
};

const schema = z.object({
  phase: z
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
  period: z
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
  // const [phase, setPhase] = useState("");
  // const [period, setPeriod] = useState("");
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const [phaseDataParams, setPhaseDataParams] = useState<PhaseDataParamsType>(
    {}
  );

  const { data } = trpc.getPhasedData.useQuery(
    {
      hdNumber: props.hdNumber,
      filters: props.filters,
      startDate: props.startDate,
      endDate: props.endDate,
      period: phaseDataParams.period!,
      phase: phaseDataParams.phase!,
      references: props.references,
    },
    {
      enabled:
        phaseDataParams.period !== undefined &&
        phaseDataParams.phase !== undefined,
    }
  );

  const { error, isLoading } = trpc.getPhaseAndEpoch.useQuery(
    {
      starId: props.hdNumber.toString(),
    },
    {
      onSuccess(data) {
        setValue("period", data?.period ?? ("" as any));
        setValue("phase", data?.epoch ?? ("" as any));
        setPhaseDataParams({
          // TODO: rename to epoch
          phase: data?.epoch ? parseFloat(data.epoch) : undefined,
          period: data?.period ? parseFloat(data.period) : undefined,
        });
      },
    }
  );

  function submit(values: FormValues) {
    setPhaseDataParams(values);
    // setPhaseDataParams({
    //   phase: phase ? parseFloat(phase) : undefined,
    //   period: period ? parseFloat(period) : undefined,
    // });
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    console.error(error);
    return <div>Failed to fetch phase and epoch for star {props.hdNumber}</div>;
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(submit)}
        className="mb-2 flex w-full flex-col items-end justify-center"
      >
        <div>
          <div className="my-2 grid w-fit grid-cols-2 gap-2">
            <label htmlFor="phaseInput">Phase:</label>
            <div>
              <Input id="phaseInput" className="!w-40" {...register("phase")} />
              <p className="text-red-500">{errors.phase?.message}</p>
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
      {data && <PhaseChart {...props} data={data} />}
    </>
  );
};

export default PhaseCurveChartSection;
