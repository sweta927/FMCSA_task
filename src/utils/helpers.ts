import { EntityData, FormattedData, MonthCount } from "../types/types";

export const columnMapper: Record<string, string> = {
  created_dt: "Created_DT",
  data_source_modified_dt: "Modifed_DT",
  entity_type: "Entity",
  operating_status: "Operating status",
  legal_name: "Legal name",
  dba_name: "DBA name",
  physical_address: "Physical address",
  phone: "Phone",
  usdot_number: "DOT",
  mc_mx_ff_number: "MC/MX/FF",
  power_units: "Power units",
  out_of_service_date: "Out of service date",
};

export const dataSummarize = (data: any[]): MonthCount => {
  const monthCount: MonthCount = {};

  data.forEach(({ created_dt, entity_type }) => {
    const date = new Date(created_dt);
    const month = date.toLocaleString("en-US", { month: "long" });

    if (!monthCount[month]) {
      monthCount[month] = {};
    }

    monthCount[month][entity_type] = (monthCount[month][entity_type] || 0) + 1;
  });

  return monthCount;
};

export const transformToFormattedData = (
  monthCount: MonthCount,
  allType: string[]
): FormattedData[] => {
  return Object.keys(monthCount).map((month) => {
    const counts = monthCount[month];

    const entry: any = { month };

    allType.forEach((type) => {
      if (type) entry[type] = counts[type] || 0;
    });

    return entry;
  });
};

export const collectEntityTypes = (data: EntityData[]): string[] => {
  const entityTypes = new Set<string>();

  data.forEach(({ entity_type }) => {
    entityTypes.add(entity_type);
  });

  return Array.from(entityTypes);
};

const getMonthWiseDataCount = (parsedData: any[]) => {
  const monthWiseDataCount = parsedData.reduce((acc, curr) => {
    const month = curr.dateMonth;
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(monthWiseDataCount).map((dataKey) => ({
    month: dataKey,
    count: monthWiseDataCount[dataKey],
  }));
};

const getYearCount = (parsedData: any[]) => {
  const yearCount = parsedData.reduce((acc, curr) => {
    const year = curr.dateYear;
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(yearCount).map((dataKey) => ({
    year: dataKey,
    count: yearCount[dataKey],
  }));
};

const getWeekCount = (parsedData: any[]) => {
  const weekCount = parsedData.reduce((acc, curr) => {
    const week = curr.dateWeek;
    acc[week] = (acc[week] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(weekCount).map((dataKey) => ({
    week: dataKey,
    count: weekCount[dataKey],
  }));
};

export const pivotChartData: Record<string, any> = {
  Week: getWeekCount,
  Month: getMonthWiseDataCount,
  Year: getYearCount,
};
