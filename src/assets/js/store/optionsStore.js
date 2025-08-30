let options = null;
let resolver;

const optionPromise = new Promise((resolve) => {
    resolver = resolve;
})

export const setOptions = (opt) => {
    options = opt;
    resolver(opt)
}

export const getOptions = () => {
    if (options) return Promise.resolve(options);
    return optionPromise;
}

