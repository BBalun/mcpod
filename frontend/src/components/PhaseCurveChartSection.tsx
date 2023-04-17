import { Button, Input, useToast } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { trpc } from "../utils/trpc";
import PhaseChart from "./PhaseCurveChart";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { System } from "../types/systems";
import { useEffect, useState } from "react";
import { useGlobalLoadingSpinner } from "../atoms/globalLoadingSpinner";

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
  const [phaseDataParams, setPhaseDataParams] = useState<PhaseDataParamsType>(
    {}
  );
  const { setSpinnerVisibility } = useGlobalLoadingSpinner();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const { isLoading: ephemeridsAreLoading } = trpc.getEphemerids.useQuery(
    props.starId,
    {
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
        toast({
          description: `Failed to fetch ephemerids for star with id ${props.starId}`,
          status: "error",
          position: "bottom-right",
        });
      },
    }
  );

  const { data, isLoading } = trpc.getPhasedData.useQuery(
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

  const [phaseData, setPhaseData] = useState(data);
  useEffect(() => {
    if (data) {
      setPhaseData(data);
    }
  }, [data]);

  useEffect(() => {
    setSpinnerVisibility(isLoading);
  }, [isLoading]);

  function submit(values: FormValues) {
    setPhaseDataParams(values);
  }

  if (ephemeridsAreLoading) {
    return null;
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
            colorScheme="facebook"
            variant="solid"
            width="full"
            isDisabled={!isValid}
          >
            Submit
          </Button>
        </div>
      </form>
      {phaseData && (
        <PhaseChart
          mainId={props.mainId}
          systems={props.systems}
          data={phaseData}
        />
      )}
    </>
  );
};

export default PhaseCurveChartSection;
