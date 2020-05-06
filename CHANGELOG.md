# Changelog

## [1.0.4] - 2019-05-06
### Added
- This changelog file.

### Fixed
- Parsing data from listing responses that would include empty attributes (empty string '') for name, market_name, and market_hash_name. These responses are ignored and the page is re-fetched.