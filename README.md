# Steam Market History Cataloger

Steam Market History Cataloger is a Chrome extension used for loading and storing your listings from the [Steam Community Market](https://steamcommunity.com/market). Steam does not offer this data in a format that is easily consumible for those that need extensive information of their transactions. This tool aims to fulfill that role in a user-friendly way.

## Installation

To use this extension, please install it from the [Chrome Web Store](https://chrome.google.com/webstore/detail/dhpcikljplaooekklhbjohojbjbinega).

## Features

*   Loads transactions from the [Steam Community Market](https://steamcommunity.com/market) in any language or currency. Listings are stored to a local database in your browser for use at any time.
*   Allows viewing and filtering of all data loaded in a neat and responsive format within the extension.
*   Transaction data can be exported to JSON and CSV. Data models for JSON can be found [below](#models).
*   Loads purchase history from your [Steam account history](https://store.steampowered.com/account/history). However, this data is not persisted to the extension.
*   Allows background loading. Not enabled by default. Enable this option from the preferences page. Loads are polled at an interval of 1 hour.
*   History pages at <https://steamcommunity.com/market> are displayed 100 results per page. More options are provided which allow you to move around your history easier.

## Exports

The extension allows you to export your listings to JSON and CSV.

More information about the data models can be found in the [EXPORTS.md](EXPORTS.md) file.

## Known Issues

*   Since history results do not usually include the year of the date, the extension must make a best guess for the year. If you have gaps larger than a year in your history results you may experience issues. This issue may or may not be resolved in the future.
*   Any refunded transactions will persist if they were not refunded at the time of loading. There is no way to remove them from your results at this point unless you clear your entire listing data.
*   Pending transactions are treated as completed transactions. More than 99% of the time these are completed successfully. In the event they don't go through they shouldn't be recorded. Keeping track of pending transactions would add a bit of complexity and it's not something I have time for now.

## Contributing

You may contribute to this project by opening an [issue](https://github.com/juliarose/Steam-Market-History-Cataloger/issues) to file a bug report. At this time new features are not a priority and are unlikely to be added.

If there is an error in the extension and you are unable to load data, the extension should log errors to the console. You can open the console with `Ctrl+Shift+J` or `Cmd+Option+J` on Mac. Please include the error message in your issue along with what currency and language your Steam account uses.

## Legal

Offered under the [GNU General Public License v2.0](LICENSE). It is offered as-is and without liability or warranty. You are free to modify and redistribute this extension as long as the source is disclosed and it is published under the same license.

Steam Market History Cataloger is not affiliated with Steam or Valve.

## Privacy Policy

This extension requires permissions to <https://steamcommunity.com> and <https://steampowered.com> to load data about your Steam account, as well as data storage to your disk. Stored data is entirely local and not shared anywhere outside of the extension.
