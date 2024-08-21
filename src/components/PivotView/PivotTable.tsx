import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import {
  MRT_ColumnDef,
  MRT_GlobalFilterTextField,
  MRT_TableInstance,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import { Cancel, Search, Share } from "@mui/icons-material";
import { BarChart, axisClasses } from "@mui/x-charts";
import { pivotChartData } from "../../utils/helpers";
import SaveModal from "../SaveModal";
import useParsedCSVData from "../../utils/hooks/useParsedCSVData";

export const PivotTable = () => {
  const { data, loading, columns } = useParsedCSVData({
    url: "DataFiles/FMSCA_records.csv",
  });

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [grouping, setGrouping] = useState<null | string>("Month");
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [filters, setFilters] = useState<any[]>(
    JSON.parse(localStorage.getItem("filters") || "[]")
  );

  useEffect(() => {
    const handleBeforeUnload = (event: any) => {
      event.preventDefault();
      setOpen(true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleModal = () => {
    setOpen(false);
  };

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

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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

  const handleGrouping = (table: MRT_TableInstance<any>, group: string) => {
    switch (group) {
      case "Month":
        table.setGrouping(["dateMonth"]);
        setGrouping("Month");
        table.setColumnVisibility({
          dateMonth: true,
          dateYear: false,
          dateWeek: false,
        });
        break;
      case "Year":
        table.setGrouping(["dateYear"]);
        setGrouping("Year");
        table.setColumnVisibility({
          dateYear: true,
          dateMonth: false,
          dateWeek: false,
        });
        break;
      case "Week":
        table.setGrouping(["dateWeek"]);
        setGrouping("Week");
        table.setColumnVisibility({
          dateYear: false,
          dateMonth: false,
          dateWeek: true,
        });
        break;
      default:
        setGrouping("");
        table.setGrouping([]);
        table.setColumnVisibility({
          dateYear: false,
          dateMonth: true,
          dateWeek: false,
        });
    }
    handleClose();
  };

  const tableComponent = useMaterialReactTable({
    columns: column,
    data: dataItems,
    enableGrouping: true,
    enableColumnResizing: true,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableColumnDragging: false,
    enableGlobalFilter: false,
    enableColumnOrdering: true,
    enableColumnFilters: false,
    state: {
      showGlobalFilter: false,
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

              <Button
                aria-controls="date-reset-btn"
                aria-haspopup="true"
                onClick={() => {
                  localStorage.removeItem("filters");
                  setFilters([]);
                }}
                variant="contained"
                sx={{ textTransform: "unset" }}
              >
                Reset
              </Button>

              <>
                <Button
                  aria-controls="date-groupby-menu"
                  aria-haspopup="true"
                  onClick={handleClick}
                  variant="contained"
                  sx={{ textTransform: "unset" }}
                >
                  Group By
                </Button>
                <Menu
                  id="date-groupby-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  {["Week", "Month", "Year", "Clear"].map((key) => {
                    return (
                      <MenuItem
                        key={key}
                        selected={key === grouping}
                        onClick={() => handleGrouping(tableComponent, key)}
                        sx={{
                          "&.Mui-selected": {
                            bgcolor: "#66b2ff",
                            color: "white",
                          },
                        }}
                      >
                        {key}
                      </MenuItem>
                    );
                  })}
                </Menu>
              </>

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
        dateMonth: true,
        dateYear: false,
        dateWeek: false,
      },
      showColumnFilters: filters.length ? true : false,
      grouping: ["dateMonth"],
    },

    autoResetAll: true,
  });

  window.addEventListener("beforeunload", function (event) {
    event.preventDefault();
    setOpen(true);
  });

  useEffect(() => {
    handleSave();
    setFilters(tableComponent.getState().columnFilters);
  }, [tableComponent.getFilteredRowModel().rows]);

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
      <MaterialReactTable table={tableComponent} />
      <Typography variant="h4" sx={{ textDecoration: "underline", mt: "1rem" }}>
        Bar Chart
      </Typography>

      <BarChart
        dataset={pivotChartData[grouping as string](dataItems)}
        xAxis={[
          {
            scaleType: "band",
            dataKey: grouping?.toLowerCase(),
            label: grouping || "",
            valueFormatter(value, context) {
              return value.split(" ").slice(0, 2).join(" ");
            },
          },
        ]}
        yAxis={[{ label: "Count" }]}
        series={Object.keys(
          pivotChartData[grouping as string](dataItems)[0] || {}
        )
          .filter((key) => key !== grouping?.toLowerCase())
          .map((key) => ({
            dataKey: key,
            label: "Companies count",
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
        sx={{
          [`& .${axisClasses.left} .${axisClasses.label}`]: {
            transform: "translateX(-10px)",
          },
        }}
        leftAxis={{
          labelStyle: {
            fontSize: 14,
            fontWeight: "bold",
          },
          tickLabelStyle: {
            fontSize: 12,
          },
        }}
        bottomAxis={{
          labelStyle: {
            fontSize: 14,
            fontWeight: "bold",
          },
        }}
        height={500}
      />

      {open && (
        <SaveModal
          handleAgree={handleSave}
          handleClose={handleModal}
          open={open}
        />
      )}
    </Box>
  );
};
