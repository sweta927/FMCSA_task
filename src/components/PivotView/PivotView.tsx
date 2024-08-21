import { Box, Typography } from "@mui/material";
import { PivotTable } from "./PivotTable";

const PivotView = () => {
  return (
    <Box sx={{ marginTop: "55px" }}>
      <Typography
        variant="h4"
        sx={{ display: "flex", justifyContent: "center", textAlign: "center" }}
      >
        PivotTable
      </Typography>
      <PivotTable />
    </Box>
  );
};

export default PivotView;
