import { Button, Input } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { trpc } from "../utils/trpc";
import PhaseChart from "./PhaseCurveChart";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { System } from "../types/systems";
import { useState } from "react";

interface PhaseChartProps {
  starId: number;
  mainId: string;
  systems: System[];
  filters: string[];
  startDate?: number;
  endDate?: number;
  referenceIds?: string[];
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

type PhaseDataParamsType = {
  epoch?: number;
  period?: number;
};

const PhaseCurveChartSection = (props: PhaseChartProps) => {
  const [error, setError] = useState<string>();
  const [phaseDataParams, setPhaseDataParams] = useState<PhaseDataParamsType>(
    {}
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const { isLoading } = trpc.getEphemerids.useQuery(props.starId, {
    onSuccess(data) {
      setValue("epoch", (data.epoch?.toString() ?? "") as any);
      setValue("period", (data.period?.toString() ?? "") as any);
      setPhaseDataParams({
        epoch: data.epoch ?? undefined,
        period: data.period ?? undefined,
      });
    },
    onError: (e) => {
      console.error(
        "Failed to fetch ephemerids for star with id",
        props.starId
      );
      console.error(e);
      setError(`Failed to fetch ephemerids for star with id ${props.starId}`);
    },
  });

  const { data } = trpc.getPhasedData.useQuery(
    {
      starId: props.starId,
      filters: props.filters,
      startDate: props.startDate,
      endDate: props.endDate,
      referenceIds: props.referenceIds,
      period: phaseDataParams.period!,
      epoch: phaseDataParams.epoch!,
    },
    {
      enabled:
        phaseDataParams.period !== undefined &&
        phaseDataParams.epoch !== undefined,
    }
  );

  function submit(values: FormValues) {
    setPhaseDataParams(values);
  }

  if (isLoading) {
    // TODO: show loading spinner
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Failed to fetch phase and epoch for star {props.mainId}</div>;
  }

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
          <Button
            type="submit"
            colorScheme="gray"
            variant="solid"
            width="full"
            isDisabled={!isValid}
          >
            Submit
          </Button>
        </div>
      </form>
      {data && (
        <PhaseChart mainId={props.mainId} systems={props.systems} data={data} />
      )}
    </>
  );
};

export default PhaseCurveChartSection;
