const msecBetweenUnixEpochAnd2k = Date.parse('01 Jan 2000 00:00:00 GMT');

const asDate = secSince2k => new Date(msecBetweenUnixEpochAnd2k + secSince2k * 1000);

export { asDate };
