import { GridColDef } from "@mui/x-data-grid";

export interface FormattedData {
  month: any;
  [entityType: string]: number;
}

export interface EntityData {
  entity_type: string;
}

export interface MonthCount {
  [month: string]: {
    [entityType: string]: number;
  };
}

export interface useParsedCSVDataProps {
  url: string;
}

export interface csvData {
  data: any[];
  errors: Error[];
  columns: GridColDef[];
  loading: boolean;
}
