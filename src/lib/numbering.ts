export const trackedNumberKinds = ["invoice", "proposal", "client"] as const;

export type TrackedNumberKind = (typeof trackedNumberKinds)[number];

type TrackedNumberConfig = {
  suffix: "F" | "O" | "C";
  sequenceWidth: number;
  usesYear: boolean;
};

type GenerateTrackedNumberOptions = {
  year?: number;
};

export type ParsedTrackedNumber = {
  kind: TrackedNumberKind;
  sequence: number;
  year: number | null;
};

const configs = {
  invoice: {
    suffix: "F",
    sequenceWidth: 3,
    usesYear: true,
  },
  proposal: {
    suffix: "O",
    sequenceWidth: 3,
    usesYear: true,
  },
  client: {
    suffix: "C",
    sequenceWidth: 4,
    usesYear: false,
  },
} satisfies Record<TrackedNumberKind, TrackedNumberConfig>;

const suffixToKind = new Map<string, TrackedNumberKind>(
  trackedNumberKinds.map((kind) => [configs[kind].suffix, kind]),
);

export function formatTrackedNumber(
  kind: TrackedNumberKind,
  sequence: number,
  options: GenerateTrackedNumberOptions = {},
) {
  assertPositiveInteger(sequence, "sequence");

  const config = configs[kind];
  const paddedSequence = sequence
    .toString()
    .padStart(config.sequenceWidth, "0");

  if (!config.usesYear) {
    return `COS-${paddedSequence}-${config.suffix}`;
  }

  const year = options.year ?? new Date().getFullYear();
  assertYear(year);

  return `COS-${year}${paddedSequence}-${config.suffix}`;
}

export function parseTrackedNumber(value: string): ParsedTrackedNumber | null {
  const match = /^COS-(?:(\d{4})(\d+)|(\d+))-([FOC])$/.exec(value);

  if (!match) {
    return null;
  }

  const [, yearValue, yearlySequenceValue, clientSequenceValue, suffix] = match;
  const kind = suffixToKind.get(suffix);

  if (!kind) {
    return null;
  }

  const config = configs[kind];
  const year = yearValue ? Number(yearValue) : null;
  const sequence = Number(yearlySequenceValue ?? clientSequenceValue);

  if (
    !Number.isSafeInteger(sequence) ||
    sequence < 1 ||
    (config.usesYear && year === null) ||
    (!config.usesYear && year !== null)
  ) {
    return null;
  }

  if (year !== null && !isValidYear(year)) {
    return null;
  }

  return {
    kind,
    sequence,
    year,
  };
}

export function getNextTrackedNumber(
  kind: TrackedNumberKind,
  existingNumbers: Iterable<string | null | undefined>,
  options: GenerateTrackedNumberOptions = {},
) {
  const config = configs[kind];
  const targetYear = config.usesYear
    ? (options.year ?? new Date().getFullYear())
    : null;

  if (targetYear !== null) {
    assertYear(targetYear);
  }

  const existing = new Set<string>();
  let highestSequence = 0;

  for (const existingNumber of existingNumbers) {
    if (!existingNumber) {
      continue;
    }

    existing.add(existingNumber);

    const parsed = parseTrackedNumber(existingNumber);

    if (
      parsed?.kind === kind &&
      parsed.year === targetYear &&
      parsed.sequence > highestSequence
    ) {
      highestSequence = parsed.sequence;
    }
  }

  let sequence = highestSequence + 1;
  let candidate = formatTrackedNumber(kind, sequence, {
    year: targetYear ?? undefined,
  });

  while (existing.has(candidate)) {
    sequence += 1;
    candidate = formatTrackedNumber(kind, sequence, {
      year: targetYear ?? undefined,
    });
  }

  return candidate;
}

function assertPositiveInteger(value: number, name: string) {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive safe integer.`);
  }
}

function assertYear(year: number) {
  if (!isValidYear(year)) {
    throw new Error("year must be a four digit safe integer.");
  }
}

function isValidYear(year: number) {
  return Number.isSafeInteger(year) && year >= 1000 && year <= 9999;
}
