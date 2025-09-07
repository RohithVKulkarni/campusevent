import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#6a1b9a", // deep purple
    },
    secondary: {
      main: "#ab47bc", // lighter purple accent
    },
    background: {
      default: "#f5f6fa", // light gray background for app
      paper: "#ffffff", // white for paper/card backgrounds
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h4: {
      fontWeight: 700,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12, // rounded corners for cards/buttons
  },
});

export default theme;
