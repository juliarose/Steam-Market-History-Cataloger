
// this script collects data about the current user
// we can also see whether the user is logged in or not

function collectAndStoreInfo() {
    function storeLoggedInUser(steamid, data) {
        if (steamid && !data.avatar) {
            // elements not available on page
            delete data.username;
            delete data.avatar;
        }
        
        data.steamcommunity_date = new Date().toString();
        // add to current settings, overwriting any overlapping properties
        Settings.addTo('logged_in_user', data);
    }
    
    function storeAccountInfo(steamid, data) {
        // key includes account's steamid
        const key = [steamid, 'accountinfo'].join('_');
        
        // add the current date
        data.date = new Date().toString();
        // override current settings
        Settings.store(key, data);
    }
    
    function getUsername() {
        const element = document.querySelector('.responsive_menu_user_area a[data-miniprofile]');
        
        return element ? element.textContent.trim() : null;
    }
    
    function getAvatar() {
        const element = document.querySelector('.responsive_menu_user_area img');
        
        return element ? element.getAttribute('src') : null;
    }
    
    let {steamid, info} = collectInfo({
        steamid: function(content) {
            const steamid = (content.match(/g_steamID\s*=\s*"(\d{17})";$/m) || [])[1];
            
            return steamid;
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
    const username = getUsername();
    const avatar = getAvatar();
    
    storeLoggedInUser(steamid, {
        username: username,
        avatar: avatar,
        steamcommunity: steamid || null,
        steamcommunity_sessionid: sessionid
    });
    
    if (steamid && info) {
        storeAccountInfo(steamid, info);
    }
}

collectAndStoreInfo();
