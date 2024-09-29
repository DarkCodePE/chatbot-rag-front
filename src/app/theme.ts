// app/theme.ts
import { extendTheme } from "@chakra-ui/react";

const customTheme = extendTheme({
    styles: {
        global: {
            body: {
                bg: "var(--techwave-site-bg-color)",
                color: "var(--techwave-body-color)",
                fontFamily: "var(--techwave-body-font-family)",
            },
        },
    },
    colors: {
        techwave: {
            main: "var(--techwave-main-color)",
            mainDark: "var(--techwave-main-color1)",
            mainLight: "var(--techwave-main-color2)",
            bg: "var(--techwave-site-bg-color)",
            headerBg: "var(--techwave-header-bg-color)",
            someRBg: "var(--techwave-some-r-bg-color)",
            someABg: "var(--techwave-some-a-bg-color)",
            heading: "var(--techwave-heading-color)",
            body: "var(--techwave-body-color)",
            border: "var(--techwave-border-color)",
            buttonBg: "var(--techwave-button-bg-color)",
            hover: "var(--techwave-hover-color)",
        },
    },
    fonts: {
        heading: "var(--techwave-heading-font-family)",
        body: "var(--techwave-body-font-family)",
    },
    components: {
        Button: {
            baseStyle: {
                fontFamily: "var(--techwave-heading-font-family)",
            },
            variants: {
                solid: {
                    bg: "techwave.buttonBg",
                    color: "techwave.heading",
                    _hover: {
                        bg: "techwave.someABg",
                        color: "techwave.hover",
                    },
                },
                ghost: {
                    color: "techwave.heading",
                    _hover: {
                        bg: "techwave.someABg",
                    },
                },
            },
        },
        Input: {
            variants: {
                outline: {
                    field: {
                        bg: "techwave.someABg",
                        borderColor: "techwave.border",
                        _hover: {
                            borderColor: "techwave.main",
                        },
                        _focus: {
                            borderColor: "techwave.main",
                            boxShadow: `0 0 0 1px var(--techwave-main-color)`,
                        },
                    },
                },
            },
        },
        Heading: {
            baseStyle: {
                color: "techwave.heading",
            },
        },
        Text: {
            baseStyle: {
                color: "techwave.body",
            },
        },
    },
});

export default customTheme;
