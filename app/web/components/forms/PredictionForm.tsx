"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Loader2, Info, Calculator, X } from "lucide-react";
import {
  AGE_OPTIONS, SEX_OPTIONS, RACE_OPTIONS, GENHEALTH_OPTIONS,
  EDUCATION_OPTIONS, INCOME_OPTIONS, YES_NO_OPTIONS,
  HYPERTENSION_OPTIONS, CHOLESTEROL_OPTIONS, YES_NO_BINARY,
  FEATURE_TOOLTIPS,
} from "@/lib/constants";

const schema = z.object({
  _BMI5:    z.number().min(10).max(100),
  _AGE80:   z.number().min(1).max(13),
  SEXVAR:   z.number().min(1).max(2),
  _IMPRACE: z.number().min(1).max(6),
  GENHLTH:  z.number().min(1).max(5),
  PHYSHLTH: z.number().min(0).max(30),
  SMOKE100: z.number().min(1).max(2),
  _TOTINDA: z.number().min(1).max(2),
  EDUCA:    z.number().min(1).max(6),
  INCOME3:  z.number().min(1).max(11),
  _RFHYPE6: z.number().min(1).max(2),
  _RFCHOL3: z.number().min(1).max(2),
  CHCKDNY2: z.number().min(1).max(2),
  _MICHD:   z.number().min(0).max(1),
});

type FormData = z.infer<typeof schema>;

interface PredictionFormProps {
  onSubmit:  (data: FormData) => Promise<void>;
  isLoading: boolean;
}

// ── Step definitions ──────────────────────────────────────────
const STEPS = [
  {
    title:    "Basic Information",
    subtitle: "Tell us about yourself",
    fields:   ["_AGE80", "SEXVAR", "_IMPRACE"],
  },
  {
    title:    "Body Metrics",
    subtitle: "Physical measurements",
    fields:   ["_BMI5", "PHYSHLTH", "GENHLTH"],
  },
  {
    title:    "Lifestyle Factors",
    subtitle: "Daily habits and activity",
    fields:   ["SMOKE100", "_TOTINDA", "EDUCA", "INCOME3"],
  },
  {
    title:    "Clinical History",
    subtitle: "Known health conditions",
    fields:   ["_RFHYPE6", "_RFCHOL3", "CHCKDNY2", "_MICHD"],
  },
];

// ── BMI category helper ───────────────────────────────────────
function bmiCategory(bmi: number): { label: string; className: string } {
  if (bmi < 18.5) return { label: "Underweight", className: "text-sky-500" };
  if (bmi < 25)   return { label: "Normal weight", className: "text-emerald-500" };
  if (bmi < 30)   return { label: "Overweight", className: "text-amber-500" };
  return { label: "Obese", className: "text-red-500" };
}

function FieldTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-muted-foreground hover:text-primary-500"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {show && (
        <div className="absolute left-6 top-0 z-50 w-56 rounded-lg border bg-card p-2 text-xs shadow-lg">
          {text}
        </div>
      )}
    </div>
  );
}

// ── BMI Calculator ────────────────────────────────────────────
function BMICalculator({ onApply }: { onApply: (bmi: number) => void }) {
  const [open, setOpen] = useState(false);
  const [unit, setUnit] = useState<"imperial" | "metric">("imperial");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");

  const computeBmi = (): number | null => {
    let heightM: number;
    const kg = parseFloat(weightKg);
    if (!kg) return null;

    if (unit === "imperial") {
      const ft = parseFloat(heightFt);
      const inch = parseFloat(heightIn) || 0;
      const totalInches = (ft || 0) * 12 + inch;
      if (!totalInches) return null;
      heightM = totalInches * 0.0254;
    } else {
      const cm = parseFloat(heightCm);
      if (!cm) return null;
      heightM = cm / 100;
    }

    if (heightM <= 0) return null;
    return Math.round((kg / (heightM * heightM)) * 10) / 10;
  };

  const bmi = computeBmi();
  const category = bmi ? bmiCategory(bmi) : null;

  const handleApply = () => {
    if (bmi) {
      onApply(bmi);
      setOpen(false);
    }
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-medium text-primary-500 hover:text-primary-600"
      >
        <Calculator className="h-3.5 w-3.5" />
        {open ? "Hide BMI calculator" : "Don't know your BMI? Calculate it"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-lg border bg-muted/40 p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex rounded-md border bg-background p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setUnit("imperial")}
                    className={`rounded px-2 py-1 transition-colors ${
                      unit === "imperial" ? "bg-primary-500 text-white" : "text-muted-foreground"
                    }`}
                  >
                    ft / kg
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit("metric")}
                    className={`rounded px-2 py-1 transition-colors ${
                      unit === "metric" ? "bg-primary-500 text-white" : "text-muted-foreground"
                    }`}
                  >
                    cm / kg
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {unit === "imperial" ? (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Height (ft)</label>
                    <input
                      type="number"
                      value={heightFt}
                      onChange={(e) => setHeightFt(e.target.value)}
                      min={1}
                      max={8}
                      placeholder="5"
                      className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Height (in)</label>
                    <input
                      type="number"
                      value={heightIn}
                      onChange={(e) => setHeightIn(e.target.value)}
                      min={0}
                      max={11}
                      placeholder="7"
                      className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Weight (kg)</label>
                    <input
                      type="number"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      min={20}
                      max={300}
                      placeholder="70"
                      className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Height (cm)</label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      min={50}
                      max={250}
                      placeholder="170"
                      className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Weight (kg)</label>
                    <input
                      type="number"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      min={20}
                      max={300}
                      placeholder="70"
                      className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                  </div>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm">
                  {bmi ? (
                    <span>
                      BMI: <span className="font-semibold">{bmi}</span>{" "}
                      <span className={category?.className}>({category?.label})</span>
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Enter height and weight</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={!bmi}
                  className="rounded-md bg-primary-500 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40 hover:bg-primary-600 transition-colors"
                >
                  Use this value
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SelectField({
  label, name, options, register, error, tooltip,
}: {
  label: string;
  name: keyof FormData;
  options: { value: number; label: string }[];
  register: any;
  error?: string;
  tooltip?: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
        {label}
        {tooltip && <FieldTooltip text={tooltip} />}
      </label>
      <select
        {...register(name, { valueAsNumber: true })}
        className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function NumberField({
  label, name, register, error, tooltip, min, max, step, placeholder, extra,
}: {
  label:       string;
  name:        keyof FormData;
  register:    any;
  error?:      string;
  tooltip?:    string;
  min:         number;
  max:         number;
  step?:       number;
  placeholder?: string;
  extra?:      React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
        {label}
        {tooltip && <FieldTooltip text={tooltip} />}
      </label>
      <input
        type="number"
        {...register(name, { valueAsNumber: true })}
        min={min}
        max={max}
        step={step || 0.1}
        placeholder={placeholder}
        className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {extra}
    </div>
  );
}

export function PredictionForm({ onSubmit, isLoading }: PredictionFormProps) {
  const [step, setStep] = useState(0);
  const {
    register, handleSubmit, trigger, setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  const handleNext = async () => {
    const valid = await trigger(currentStep.fields as (keyof FormData)[]);
    if (valid) setStep((s) => s + 1);
  };

  const renderField = (field: string) => {
    switch (field) {
      case "_BMI5":
        return (
          <NumberField
            key={field}
            label="BMI"
            name="_BMI5"
            register={register}
            error={errors._BMI5?.message}
            tooltip={FEATURE_TOOLTIPS._BMI5}
            min={10}
            max={100}
            step={0.1}
            placeholder="e.g. 25.4"
            extra={
              <BMICalculator
                onApply={(bmi) => setValue("_BMI5", bmi, { shouldValidate: true, shouldDirty: true })}
              />
            }
          />
        );
      case "_AGE80":
        return <SelectField key={field} label="Age Group" name="_AGE80" register={register}
          options={AGE_OPTIONS} error={errors._AGE80?.message} tooltip={FEATURE_TOOLTIPS._AGE80} />;
      case "SEXVAR":
        return <SelectField key={field} label="Sex" name="SEXVAR" register={register}
          options={SEX_OPTIONS} error={errors.SEXVAR?.message} tooltip={FEATURE_TOOLTIPS.SEXVAR} />;
      case "_IMPRACE":
        return <SelectField key={field} label="Race / Ethnicity" name="_IMPRACE" register={register}
          options={RACE_OPTIONS} error={errors._IMPRACE?.message} tooltip={FEATURE_TOOLTIPS._IMPRACE} />;
      case "GENHLTH":
        return <SelectField key={field} label="General Health" name="GENHLTH" register={register}
          options={GENHEALTH_OPTIONS} error={errors.GENHLTH?.message} tooltip={FEATURE_TOOLTIPS.GENHLTH} />;
      case "PHYSHLTH":
        return <NumberField key={field} label="Good Physical Health Days (last 30)" name="PHYSHLTH"
          register={register} error={errors.PHYSHLTH?.message} tooltip={FEATURE_TOOLTIPS.PHYSHLTH}
          min={0} max={30} step={1} placeholder="0–30" />;
      case "SMOKE100":
        return <SelectField key={field} label="Smoked 100+ cigarettes in lifetime?" name="SMOKE100"
          register={register} options={YES_NO_OPTIONS} error={errors.SMOKE100?.message}
          tooltip={FEATURE_TOOLTIPS.SMOKE100} />;
      case "_TOTINDA":
        return <SelectField key={field} label="Physical Activity (last 30 days)?" name="_TOTINDA"
          register={register} options={[{ value: 1, label: "Yes" }, { value: 2, label: "No" }]}
          error={errors._TOTINDA?.message} tooltip={FEATURE_TOOLTIPS._TOTINDA} />;
      case "EDUCA":
        return <SelectField key={field} label="Highest Education Level" name="EDUCA"
          register={register} options={EDUCATION_OPTIONS} error={errors.EDUCA?.message}
          tooltip={FEATURE_TOOLTIPS.EDUCA} />;
      case "INCOME3":
        return <SelectField key={field} label="Annual Household Income" name="INCOME3"
          register={register} options={INCOME_OPTIONS} error={errors.INCOME3?.message}
          tooltip={FEATURE_TOOLTIPS.INCOME3} />;
      case "_RFHYPE6":
        return <SelectField key={field} label="Told you have high blood pressure?" name="_RFHYPE6"
          register={register} options={HYPERTENSION_OPTIONS} error={errors._RFHYPE6?.message}
          tooltip={FEATURE_TOOLTIPS._RFHYPE6} />;
      case "_RFCHOL3":
        return <SelectField key={field} label="Told your cholesterol is high?" name="_RFCHOL3"
          register={register} options={CHOLESTEROL_OPTIONS} error={errors._RFCHOL3?.message}
          tooltip={FEATURE_TOOLTIPS._RFCHOL3} />;
      case "CHCKDNY2":
        return <SelectField key={field} label="Told you have kidney disease?" name="CHCKDNY2"
          register={register} options={YES_NO_OPTIONS} error={errors.CHCKDNY2?.message}
          tooltip={FEATURE_TOOLTIPS.CHCKDNY2} />;
      case "_MICHD":
        return <SelectField key={field} label="Heart disease or heart attack?" name="_MICHD"
          register={register} options={YES_NO_BINARY} error={errors._MICHD?.message}
          tooltip={FEATURE_TOOLTIPS._MICHD} />;
      default:
        return null;
    }
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span>{currentStep.title}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary-500 transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        {/* Step indicators */}
        <div className="flex justify-between mt-2">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i <= step ? "bg-primary-500" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step title */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold">{currentStep.title}</h2>
        <p className="text-sm text-muted-foreground">{currentStep.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
          >
            {currentStep.fields.map(renderField)}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {isLastStep ? (
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg bg-primary-500 px-6 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-60 transition-colors"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Predicting…</>
              ) : (
                <>Predict My Risk<ChevronRight className="h-4 w-4" /></>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded-lg bg-primary-500 px-5 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}