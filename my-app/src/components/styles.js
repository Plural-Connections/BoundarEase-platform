import { createTheme } from "@mui/material"

export const desktopH2Style = {
    fontSize: "1.25rem",
    fontWeight: 500,
    marginBottom: "-2px"
}

export const desktopDateStyle = {
    fontSize: "0.875rem", 
    fontStyle: "italic"
}

export const desktopTextStyle = {
    fontSize: "0.8rem"
}

export const mobileH2Style = {
    fontSize: "20px",
    fontWeight: 500,
    marginBottom: "-2px"
}

export const mobileDateStyle = {
    fontSize: "14px", 
    fontStyle: "italic"
}

export const mobileTextStyle = {
    fontSize: "12px"
}


export const theme = createTheme()

theme.typography.h2 = {
    fontSize: "1.25rem"
}

theme.typography.caption = {
    fontStyle: "italic",
    fontSize: "1.1rem"
}

theme.typography.h6 = {
    fontStyle: "italic",
    fontSize: "1.2rem",
    fontWeight: 500
}

export const widthStyles = {
    width: { xs: '95%', sm: '90%', md: '80%', lg: '70%' }
}