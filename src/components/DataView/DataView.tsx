import { Box, Typography } from "@mui/material";
import { DataViewTable } from "./DataViewTable";

const DataView = () => {
  return (
    <Box sx={{ marginTop: "55px" }}>
      <Typography
        variant="h4"
        sx={{ display: "flex", justifyContent: "center", textAlign: "center" }}
      >
        DataTable
      </Typography>
      <DataViewTable />
    </Box>
  );
};

export default DataView;
