// @ts-check

import { getClassinfo } from '../../../steam/index.js';
import { buildLink } from './buildLink.js';

export const buildThirdPartyLinks = {
    /**
     * Fetches asset data from Steam to display links.
     * @param {Object} record - Record to fetch asset for.
     * @returns {Promise<HTMLElement[]>} Resolves with array of links when done.
     */
    async withAsset(record) {
        const asset = await getClassinfo(record.appid, record.classid, record.instanceid);
        
        switch (record.appid) {
            case '440': {
                const appData = asset.app_data;
                const defindex = appData.def_index;
                const quality = appData.quality;
                
                return [
                    buildLink({
                        url: `http://wiki.teamfortress.com/scripts/itemredirect.php?id=${defindex}`,
                        title: 'Wiki'
                    }),
                    buildLink({
                        url: `https://backpack.tf/stats/${quality}/${defindex}/1/1`,
                        title: 'backpack.tf'
                    }),
                    buildLink({
                        url: `https://marketplace.tf/items/${defindex};${quality}`,
                        title: 'Marketplace.tf'
                    })
                ];
            }
        }
        
        return [];
    },
    /**
     * Generates placeholders for links.
     * @param {Object} item - Item to generate placeholders for.
     * @returns {Object[]} Array of placeholder links.
     */
    placeholder(item) {
        switch (item.appid) {
            case '440':
                return [
                    buildLink({
                        url: '#',
                        title: 'Wiki',
                        placeholder: true
                    }),
                    buildLink({
                        url: '#',
                        title: 'backpack.tf',
                        placeholder: true
                    }),
                    buildLink({
                        url: '#',
                        title: 'marketplace.tf',
                        placeholder: true
                    })
                ];
            default:
                return [];
        }
    }
};
