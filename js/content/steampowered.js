
// UNUSED
// this script collects data about the current user
// we can also see whether the user is logged in or not

function collectAndStoreInfo() {
    function storeLoggedInUser(data) {
        data.steampowered_date = new Date().toString();
        
        // add to current settings, overwriting any overlapping properties
        Settings.addTo('logged_in_user', data);
    }
    
    const { steamid } = collectInfo({
        steamid(content) {
            function getAccountid(content) {
                return (content.match(/g_AccountID\s*=\s*(\d+);$/m) || [])[1];
            }
            
            /**
             * Converts a 32-bit account id to steamid64.
             * @param {string} accountid - Accountid to convert.
             * @returns {string} Steamid64 in string format.
             */
            function to64(accountid) {
                return (BigInt(accountid) + BigInt('76561197960265728')).toString();
            }
            
            const accountid = getAccountid(content);
            
            if (!accountid) {
                return null;
            }
            
            return to64(accountid);
        }
    });
    const sessionid = getCookie('sessionid');
    
    storeLoggedInUser({
        steampowered: steamid || null,
        steampowered_sessionid: sessionid
    });
}

collectAndStoreInfo();
