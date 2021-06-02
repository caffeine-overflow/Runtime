const resetPassword = (name, link) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <style>
        @media only screen and (max-width: 600px) {
            .main {
                width: 320px !important;
            }

            .top-image {
                width: 100% !important;
            }

            .inside-footer {
                width: 320px !important;
            }

            table[class="contenttable"] {
                width: 320px !important;
                text-align: left !important;
            }

            td[class="force-col"] {
                display: block !important;
            }

            td[class="rm-col"] {
                display: none !important;
            }

            .mt {
                margin-top: 15px !important;
            }

            *[class].width300 {
                width: 255px !important;
            }

            *[class].block {
                display: block !important;
            }

            *[class].blockcol {
                display: none !important;
            }

            .emailButton {
                width: 100% !important;
            }

            .emailButton a {
                display: block !important;
                font-size: 18px !important;
            }

        }
    </style>

    <body>

        <body link="#00a5b5" vlink="#00a5b5" alink="#00a5b5">
            <table class=" main contenttable" align="center"
                style="font-weight: normal;border-collapse: collapse;border: 0;margin-left: auto;margin-right: auto;padding: 0;font-family: Arial, sans-serif;color: #555559;background-color: white;font-size: 16px;line-height: 26px;width: 600px;">
                <tr>
                    <td class="border"
                        style="border-collapse: collapse;border: 1px solid #eeeff0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;">
                        <table
                            style="font-weight: normal;border-collapse: collapse;border: 0;margin: 0;padding: 0;font-family: Arial, sans-serif;">
                            <tr>
                                <td colspan="4" valign="top" class="image-section"
                                    style="border-collapse: collapse;border: 0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;background-color: #fff;border-bottom: 4px solid #00a5b5">
                                </td>
                            </tr>
                            <tr>
                                <td valign="top" class="side title"
                                    style="border-collapse: collapse;border: 0;margin: 0;padding: 20px;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;vertical-align: top;background-color: white;border-top: none;">
                                    <table
                                        style="font-weight: normal;border-collapse: collapse;border: 0;margin: 0;padding: 0;font-family: Arial, sans-serif;">
                                        <tr>
                                            <td class="head-title"
                                                style="border-collapse: collapse;border: 0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 28px;line-height: 34px;font-weight: bold; text-align: center;">
                                                <div class="mktEditable" id="main_title">
                                                    Reset Your Password
                                                </div>
                                                <br>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="top-padding"
                                                style="border-collapse: collapse;border: 0;margin: 0;padding: 5px;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;">
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="grey-block"
                                                style="border-collapse: collapse;border: 0;margin: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;background-color: #fff; text-align:center;">
                                                <div class="mktEditable" id="cta">
                                                    <img class="top-image"
                                                        src="https://images.unsplash.com/photo-1492551557933-34265f7af79e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                                                        width="560" /><br><br>
                                                    <div class="mktEditable" id="main_text">
                                                        Hello ${name}, <br>
                                                        You are receiving this email because you requested to change your password. Please click the link below to reset your password. <br>
                                                        If you have not requested to reset the password, please ignore this email.
                                                    </div><br>
                                                    <a href=${link} target="_blank"><strong>Password Reset Link</strong></a> <br><br>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr bgcolor="#fff" style="border-top: 4px solid #00a5b5;">
                                <td valign="top" class="footer"
                                    style="border-collapse: collapse;border: 0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;background: #fff;text-align: center;">
                                    <table
                                        style="font-weight: normal;border-collapse: collapse;border: 0;margin: 0;padding: 0;font-family: Arial, sans-serif;">
                                        <tr>
                                            <td class="inside-footer" align="center" valign="middle"
                                                style="border-collapse: collapse;border: 0;margin: 0;padding: 20px;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 12px;line-height: 16px;vertical-align: middle;text-align: center;width: 580px;">
                                                <div id="address" class="mktEditable">
                                                    <b>Runtime App</b><br>
                                                    <a style="color: #00a5b5;" href="mailto:runtimeapp@hotmail.com">Contact
                                                        Us</a>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
    </body>
    </html>
    `
}

module.exports = { resetPassword };