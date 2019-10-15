
// UNUSED
// this script collects data about the current user
// we can also see whether the user is logged in or not

function collectAndStoreInfo() {
    function storeLoggedInUser(steamid, data) {
        data.steampowered_date = new Date().toString();
        
        // add to current settings, overwriting any overlapping properties
        Settings.addTo('logged_in_user', data);
    }
    
    const {steamid, info} = collectInfo({
        steamid: function(content) {
            function getAccountid(content) {
                return (content.match(/g_AccountID\s*=\s*(\d+);$/m) || [])[1];
            }
            
            /**
             * Converts a 32-bit account id to steamid64.
             * @param {String} accountid - Accountid to convert.
             * @returns {String} Steamid64 in string format.
             */
            function to64(accountid) {
                return (BigInt(accountid) + BigInt(76561197960265728)).toString();
            }
            
            const accountid = getAccountid(content);
            
            if (accountid) {
                return to64(accountid);
            } else {
                return null;
            }
        },
        info: function(content) {
            function getWalletInfo(content) {
                const match = content.match(/g_rgWalletInfo\s*=\s*({.*});$/m);
                const json = match && JSON.parse(match[1]);
                
                if (json) {
                    // we only want to store these keys
                    return pickKeys(json, [
                        'wallet_currency', 'wallet_country', 'wallet_fee',
                        'wallet_fee_minimum', 'wallet_fee_percent',
                        'wallet_publisher_fee_percent_default', 'wallet_fee_base',
                        'wallet_max_balance', 'wallet_trade_max_balance'
                    ]);
                } else {
                    return null;
                }
            }
            
            function getCountry(content) {
                return (content.match(/g_strCountryCode\s*=\s*"(\w+)";$/m) || [])[1];
            }
            
            function getLanguage(content) {
                return (content.match(/g_strLanguage\s*=\s*"(\w+)";$/m) || [])[1];
            }
            
            const wallet = getWalletInfo(content);
            const country = getCountry(content);
            const language = getLanguage(content);
            const hasData = Boolean(
                wallet &&
                country &&
                language
            );
            
            if (hasData) {
                // add country and language to wallet object to condense this down
                return Object.assign(wallet, {
                    country,
                    language
                });
            }
        }
    });
    const sessionid = getCookie('sessionid');
    
    storeLoggedInUser(steamid, {
        steampowered: steamid || null,
        steampowered_sessionid: sessionid
    });
}

collectAndStoreInfo();
