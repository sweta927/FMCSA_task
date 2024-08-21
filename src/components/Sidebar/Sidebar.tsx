import React from "react";
import {
  Box,
  Divider,
  SwipeableDrawer,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Close } from "@mui/icons-material";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleDrawer = (open: boolean) => () => {
    setIsOpen(open);
  };

  const goToDataView = () => navigate("/");
  const goToPivotView = () => navigate("/pivotTable");

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={toggleDrawer(true)}
        sx={{
          position: "fixed",
          top: 20,
          left: 20,
          zIndex: 1001,
        }}
      >
        <Menu />
      </Button>
      <SwipeableDrawer
        anchor="left"
        open={isOpen}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        transitionDuration={300}
        sx={{
          width: 250,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 250,
            boxSizing: "border-box",
          },
        }}
      >
        <Box
          sx={{
            width: 250,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <IconButton
            onClick={toggleDrawer(false)}
            sx={{
              alignSelf: "flex-end",
              marginRight: "10px",
              marginTop: "10px",
            }}
          >
            <Close />
          </IconButton>
          <Typography
            variant="subtitle1"
            sx={{
              cursor: "pointer",
              color: isActive("/") ? "white" : "black",
              backgroundColor: isActive("/") ? "#1976d2" : "none",
              width: "100%",
              textAlign: "left",
              padding: "10px",
              textDecoration: "none",
              "&:hover": {
                backgroundColor: isActive("/") ? "#1565c0" : "lightgrey",
              },
            }}
            onClick={goToDataView}
          >
            DataView
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              cursor: "pointer",
              color: isActive("/pivotTable") ? "white" : "black",
              backgroundColor: isActive("/pivotTable") ? "#1976d2" : "none",
              width: "100%",
              textAlign: "left",
              padding: "10px",
              textDecoration: "none",
              "&:hover": {
                backgroundColor: isActive("/pivotTable")
                  ? "#1565c0"
                  : "lightgrey",
              },
            }}
            onClick={goToPivotView}
          >
            PivotView
          </Typography>
          <Divider sx={{ my: 2 }} />
        </Box>
      </SwipeableDrawer>
    </>
  );
};

export default Sidebar;
