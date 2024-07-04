export const intervals = [
    {
        id: '1h',
        name: 'Every Hour',
        cron: '0 * * * *',
    },
    {
        id: '12h',
        name: 'Every 12 hours',
        cron: '0 */12 * * *',
    },
    {
        id: '1d',
        name: 'Every Day',
        cron: '0 0 * * *',
    },
    {
        id: '1w',
        name: 'Every Week',
        cron: '0 0 * * 0',
    },
    {
        id: '1mo',
        name: 'Every Month',
        cron: '0 0 1 * *',
    },
]