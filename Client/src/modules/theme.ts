import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#757ce8',
      main: '#3f50b5',
      dark: '#002884',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#f06292',
      dark: '#ba000d',
      contrastText: '#f06292',
    },
    text: {
      primary: 'rgba(5, 25, 255, 0.87)',
      secondary: 'rgba(200, 215, 245, 0.50)',
      disabled: 'rgba(0, 0, 0, 0.38)',
      hint: 'rgba(0, 0, 0, 0.38)',
    }
  },
});

export default theme