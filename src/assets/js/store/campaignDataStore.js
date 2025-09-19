let campaignData = null;
let resolver;

const dataPromise = new Promise((resolve) => {
    resolver = resolve;
})

export const setCampaignData = (opt) => {
    campaignData = opt;
    resolver(opt)
}

export const getCampaignData = () => {
    if (campaignData) return Promise.resolve(campaignData);
    return dataPromise;
}

