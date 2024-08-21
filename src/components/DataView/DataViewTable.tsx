import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";

import {
  MRT_ColumnDef,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Cancel, Search, Share } from "@mui/icons-material";
import { BarChart, axisClasses } from "@mui/x-charts";
import { DateTime } from "luxon";
import {
  dataSummarize,
  collectEntityTypes,
  transformToFormattedData,
} from "../../utils/helpers";
import useParsedCSVData from "../../utils/hooks/useParsedCSVData";
import ResetModal from "../ResetModal";

export const DataViewTable = () => {
  const { data, loading, columns } = useParsedCSVData({
    url: "DataFiles/FMSCA_records.csv",
  });

  const isFirstRender = useRef(true);

  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [filters, setFilters] = useState<any[]>(
    JSON.parse(localStorage.getItem("filters") || "[]")
  );

  useEffect(() => {
    const handleBeforeUnload = (event: any) => {
      event.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    filters.forEach((filter) => {
      params.append(filter.id, filter.value);
    });
    const newUrl = `${window.location.pathname.replace(
      /\/$/,
      ""
    )}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
  }, [filters]);

  useEffect(() => {
    const params = new URLSearchParams();

    filters.forEach((filter) => {
      params.append(filter.id, filter.value);
    });

    if (isFirstRender.current) {
      const tableFiltersFromURL = [];
      for (const [key, value] of new URL(window.location.href).searchParams) {
        if (value) tableFiltersFromURL.push({ id: key, value });
      }

      if (tableFiltersFromURL.length > 0) {
        setFilters(tableFiltersFromURL);
      }
      isFirstRender.current = false;

      return;
    }

    const newUrl = `${window.location.pathname.replace(/\/$/, "")}${
      "?" + params.toString()
    }`;
    window.history.pushState({}, "", newUrl);
    handleSave();
  }, [filters]);

  const column = useMemo(
    () =>
      [
        ...columns,
        {
          headerName: "Month",
          field: "dateMonth",
        },
        {
          headerName: "Year",
          field: "dateYear",
        },
        {
          headerName: "Week",
          field: "dateWeek",
        },
      ].map((col) => ({
        ...col,
        header: col.headerName,
        enableColumnOrdering: true,
        accessorKey: col.field,
        type: ["created_dt", "data_source_modified_dt"].includes(col.field)
          ? "date"
          : "string",
        ...(["created_dt", "data_source_modified_dt"].includes(col.field) && {
          sortingFn: (rowA, rowB, columnId) => {
            return DateTime.fromFormat(
              rowA.getValue(columnId),
              "dd LLL, yyyy hh:MM a"
            ) >
              DateTime.fromFormat(
                rowB.getValue(columnId),
                "dd LLL, yyyy hh:MM a"
              )
              ? -1
              : 1;
          },
        }),
      })) as MRT_ColumnDef<any, string>[],
    [columns]
  );

  const dataItems = useMemo(
    () =>
      data.map((dataItem) => ({
        ...dataItem,
        created_dt: DateTime.fromJSDate(new Date(dataItem.created_dt)).toFormat(
          "dd LLL, yyyy hh:MM a"
        ),
        dateMonth: DateTime.fromJSDate(new Date(dataItem.created_dt)).toFormat(
          "LLLL"
        ),
        dateYear: DateTime.fromJSDate(new Date(dataItem.created_dt)).toFormat(
          "yyyy"
        ),
        dateWeek:
          "Week " +
          DateTime.fromJSDate(new Date(dataItem.created_dt)).toFormat(`W`) +
          ` (${DateTime.fromJSDate(new Date(dataItem.created_dt))
            .startOf("week")
            .toFormat("d MMM, yyyy")} - ${DateTime.fromJSDate(
            new Date(dataItem.created_dt)
          )
            .endOf("week")
            .toFormat("d MMM, yyyy")})`,
        data_source_modified_dt: DateTime.fromJSDate(
          new Date(dataItem.data_source_modified_dt)
        ).toFormat("dd LLL, yyyy hh:MM a"),
      })),
    [data]
  );

  const tableComponent = useMaterialReactTable({
    columns: column,
    data: dataItems,
    enableGrouping: false,
    enableColumnResizing: true,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableColumnDragging: true,
    enableGlobalFilter: true,
    enableColumnOrdering: true,
    enableColumnFilters: true,
    state: {
      showGlobalFilter: true,
      density: "compact",
      isLoading: loading,
      showLoadingOverlay: false,
      showProgressBars: loading,
      columnFilters: filters,
    },
    muiTableBodyRowProps: {
      sx: {
        fontSize: 14,
      },
    },
    muiTablePaperProps: {
      sx: { border: "2px solid gray", height: "100%" },
    },
    muiTableContainerProps: { sx: { height: "80%" } },
    renderTopToolbar: ({ table }) => {
      return (
        <Box
          sx={{
            display: "flex",
            gap: "0.5rem",
            p: "8px",
            justifyContent: "flex-end",
            borderBottom: "0.5px solid lightgray",
          }}
        >
          <Box sx={{ display: "flex", gap: "0.5rem" }}>
            <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              {showSearch && (
                <MRT_GlobalFilterTextField table={tableComponent} />
              )}

              <IconButton onClick={() => setShowSearch((prev) => !prev)}>
                {showSearch ? <Cancel /> : <Search />}
              </IconButton>
              <MRT_ToggleFiltersButton table={tableComponent} />
              <Button
                aria-controls="date-reset-btn"
                aria-haspopup="true"
                onClick={() => {
                  setOpen(true);
                }}
                variant="contained"
                sx={{ textTransform: "unset" }}
              >
                Reset
              </Button>

              <Button
                aria-controls="date-share-btn"
                aria-haspopup="true"
                onClick={() => {
                  const currentUrl = window.location.href;
                  navigator.clipboard
                    .writeText(currentUrl)
                    .then(() => {
                      alert("URL copied to clipboard!");
                    })
                    .catch((err) => {
                      console.error("Failed to copy URL: ", err);
                    });
                }}
                variant="contained"
                sx={{ textTransform: "unset" }}
              >
                <Share />
              </Button>
            </Box>
          </Box>
        </Box>
      );
    },
    onColumnFiltersChange: setFilters,
    initialState: {
      columnVisibility: {
        dateMonth: false,
        dateYear: false,
        dateWeek: false,
      },
      showColumnFilters: filters.length ? true : false,
      grouping: ["dateMonth"],
    },

    autoResetAll: true,
  });

  const [requiredData, setRequiredData] = useState(
    tableComponent.getFilteredRowModel().rows.map((item) => item.original)
  );

  const entyChartData = useMemo(
    () =>
      transformToFormattedData(
        dataSummarize(requiredData),
        collectEntityTypes(requiredData)
      ),
    [requiredData]
  );

  window.addEventListener("beforeunload", function (event) {
    event.preventDefault();

  });

  const handleReset = () => {
    localStorage.removeItem("filters");
    setFilters([]);
    setOpen(false);
  };

  useEffect(() => {
    setRequiredData(
      tableComponent.getFilteredRowModel().rows.map((item) => item.original)
    );
    handleSave();
    setFilters(tableComponent.getState().columnFilters);
  }, [tableComponent.getFilteredRowModel().rows]);

  const handleModal = () => {
    setOpen(false);
  };

  const handleSave = useCallback(() => {
    const filterArray = tableComponent.getState().columnFilters || [];
    localStorage.setItem("filters", JSON.stringify(filterArray));
    handleModal();
  }, [tableComponent.getFilteredRowModel().rows]);

  return (
    <Box
      sx={{
        p: "1rem",
        boxSizing: "border-box",
        height: "100%",
        textAlign: "center",
      }}
    >
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <MaterialReactTable table={tableComponent} />
          <Typography
            variant="h4"
            sx={{ textDecoration: "underline", mt: "1rem" }}
          >
            Bar Chart
          </Typography>

          <BarChart
            dataset={entyChartData}
            xAxis={[{ scaleType: "band", dataKey: "month", label: "Month" }]}
            yAxis={[{ label: "Count" }]}
            series={Object.keys(entyChartData[0] || {})
              .filter((key) => key !== "month")
              .map((key) => ({
                dataKey: key,
                label: key,
              }))}
            slotProps={{
              legend: {
                hidden: true,
                labelStyle: {
                  fontSize: 12,
                  display: "none",
                },
              },
            }}
            leftAxis={{
              labelStyle: {
                fontSize: 14,
              },
              tickLabelStyle: {
                fontSize: 12,
              },
            }}
            sx={{
              [`& .${axisClasses.left} .${axisClasses.label}`]: {
                transform: "translateX(-10px)",
              },
            }}
            height={500}
          />

          {open && (
            <ResetModal
              handleAgree={handleReset}
              handleClose={handleModal}
              open={open}
            />
          )}
        </>
      )}
    </Box>
  );
};
