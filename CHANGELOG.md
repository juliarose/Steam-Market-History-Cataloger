# Changelog

## [1.2.2] - 2024-07-08
### Fixed
- web_accessible_resources not having access to dom-parser which caused content scripts to not work.

## [1.2.1] - 2024-06-24

### Added
- Dark theme. This is determined by the system theme.
- More detailed error messages when parsing fails.
- CHF currency.

### Changed
- The applist to include up-to-date apps.

### Fixed
- Parsing purchase history results.
- A bug where filtering queries would return results from previous queries.

(unreleased)

## [1.2.0] - 2024-06-07
### Fixed
- Parsing listings as a result of history no longer including seller information.
- Parsing Polish złoty (PLN) currency.

### Changed
- Updated extension to Manifest V3. There are some limitations to Manifest V3 which required many changes to the codebase but shouldn't affect the user experience. Notably, background tasks are changed in favor of service workers which run only when the service worker is actively doing something. 
- Significant refactor of the codebase. Many factory-style functions were replaced in favor of ES6 classes. This makes it much easier to reason about as well as document. However, this may have introduced new bugs.
- Updated ESLint to use the flat configuration format.
- Updated the localization files.

## [1.1.3] - 2021-02-23
### Fixed
- Issue with download streams limiting results to 5000.

### Changed
- JPY shows 2 decimals rather than 0.

## [1.1.2] - 2021-02-11
### Fixed
- Last week/month filters not always working due to improper date formats.

### Changed
- Titles on pages to include "Steam Market History Cataloger".

## [1.1.1] - 2021-01-22
### Added
- Last week quick-select button on filters for selecting date from the past week.
- Last month quick-select button on filters for selecting date from the past month.

### Fixed
- Bug with not showing new listing count.
- Using search results limit from preferences.

### Changed
- Date filters will now additionally select dates that are equal to the date selected.
- Updated the localization files.

## [1.1.0] - 2021-01-03
### Changed
- Viewing records no longer loads all listings at once. This is to limit consumption of resources.
- Records are fetched from the database as-needed based on filter results.
- Downloading records where the results are greater than the limit will result in records being streamed to the file.

### Removed
- "View recent" button as it is no longer needed. This was intended as a quicker option to view your most recent transactions, but with the new search functionality listed above it is no longer necessary.

## [1.0.4] - 2019-05-06
### Added
- This changelog file.

### Fixed
- Parsing data from listing responses that would include empty attributes (empty string '') for name, market_name, and market_hash_name. These responses are ignored and the page is re-fetched.
