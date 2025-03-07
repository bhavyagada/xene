import { ascending, mean, deviation, quantile } from 'd3'

function getPuzzleBasedData(data, puzzles, type) {
    let res = [], names_data = {}

    data.forEach(val => { let puzzleScore = {}; puzzleScore[val['puzzleId']] = val['score']; res.push(puzzleScore) })
    res.forEach(val => names_data[Object.keys(val)[0]] = puzzles.find(x => x.id == Object.keys(val)[0]).name)

    return {
        json: res,
        keys: {
            value: [...new Set(Object.entries(res).map(val => Object.keys(val[1])[0]))]
        },
        type: type,
        names: names_data
    }
}

function donut(data, puzzles) {
    let donut_data = {}

    if (puzzles) {
        donut_data = getPuzzleBasedData(data, puzzles, 'donut')
    } else {
        donut_data = {
            json: data,
            keys: {
                value: ['time', 'edits', 'conciseness', 'complexity']
            },
            type: 'donut'
        }
    }

    return {
        bindto: '#donut_chart',
        data: donut_data,
        donut: {
            title: 'Score Attributes'
        },
        tooltip: {
            position: function (data, width, height, element) {
                return { top: 0 }
            }
        }
    }
}

function pie(data, puzzles) {
    let pie_data = {}

    if (puzzles) {
        pie_data = getPuzzleBasedData(data, puzzles, 'pie')
    } else {
        pie_data = {
            json: data,
            keys: {
                value: ['time', 'edits', 'conciseness', 'complexity']
            },
            type: 'pie'
        }
    }

    return {
        bindto: '#pie_chart',
        data: pie_data,
        tooltip: {
            position: function (data, width, height, element) {
                return { top: 0 }
            }
        }
    }
}

function stackedBar(data, puzzles) {
    return {
        bindto: '#stacked_bar',
        data: {
            json: data,
            keys: {
                value: ['time', 'edits', 'conciseness', 'complexity', 'score']
            },
            type: 'bar',
            order: null,
            groups: [['time', 'edits', 'conciseness', 'complexity']],
            types: {
                score: 'spline'
            },
            colors: {
                score: '#a3f7bf'
            }
        },
        bar: {
            width: {
                ratio: 0.45
            }
        },
        axis: {
            x: {
                type: 'category',
                categories: data.map(
                    res => puzzles.find(puzzle => puzzle.id === res.id).name
                )
            }
        }
    }
}

function axesRotated(data) {

    return {
        bindto: '#axes_rotated',
        data: {
            json: data.result,
            keys: {
                value: ['score']
            },
            types: {
                score: 'bar'
            }
        },
        bar: {
            width: {
                ratio: 0.2
            }
        },
        axis: {
            rotated: true,
            x: {
                type: 'category',
                categories: data.result.map(res => {
                    let user = data.users.find(user => user.sub === res.sub)
                    return user.name.match(/\S+@\S+\.\S+/)
                        ? user.nickname
                        : user.name
                })
            },
            y: {
                label: {
                    text: 'Sum of scores'
                },
                tick: {
                    format: x => Math.round(x / 1000) + 'k',
                }
            }
        }
    }
}

function areaStep(data, puzzles) {
    let result = {
        bindto: '#area_step_chart',
        data: {
            json: [],
        }
    }
    if (data.length > 0) {
        result.data.json = data,
            result.data['keys'] = {
                value: ['Users']
            }

        result.data['type'] = 'area-step'
        result.axis = {
            x: {
                type: 'category',
                categories: data.map(
                    res => puzzles.find(puzzle => puzzle.id === res.puzzleId).name
                )
            }
        }
    }

    return result
}

function scatter(data) {
    return {
        bindto: '#scatter_chart',
        data: {
            xs: {
                time: 'score',
                edits: 'score',
                conciseness: 'score',
                complexity: 'score',
            },
            json: data,
            keys: {
                value: ['time', 'edits', 'conciseness', 'complexity', 'score']
            },
            type: 'scatter',
            colors: {
                time: '#00BCEB',
                edits: '#FF9800',
                conciseness: '#D50000',
                complexity: '#A3F7BF',
            },
        },
        axis: {
            x: {
                label: 'Score',
                tick: {
                    fit: false,
                    format: x => (x / 1000).toFixed(1) + 'k',
                },
                padding: { left: 25, right: 25 },
            },
            y: {
                label: 'Attribute'
            }
        },
        padding: {
            right: 5,
        },
    }
}

function boxplot(data, puzzles) {
    function filterAttribute(attribute) {
        return data.map(res => res[attribute])
    }

    function calculateBoxplotParameter(box_data) {
        let values = box_data.sort(ascending)

        const min = values[0]
        const max = values[values.length - 1]
        const q1 = quantile(values, 0.25)
        const q2 = quantile(values, 0.5)
        const q3 = quantile(values, 0.75)
        const iqr = (q3 - q1) * 1.5
        const r0 = Math.max(min, q1 - iqr)
        const r1 = Math.min(max, q3 + iqr)

        return {
            min: r0,
            a1: q1 - r0,
            a2: r1 - q3,
            b1: q2 - q1,
            b2: q3 - q2,
            m: 0,
            high: 0,
            low: 0,
            median: q2,
            max: r1,
            iq1: q1,
            iq3: q3,
            iqr: q3 - q1
        }
    }

    let boxplot_data = [], category_data = null

    if (puzzles) {
        let puzzles_data = {}
        data.forEach(x => {
            if (puzzles_data.hasOwnProperty(x.puzzleId)) {
                puzzles_data[x.puzzleId].push(x.score)
            } else {
                puzzles_data[x.puzzleId] = [x.score]
            }        
        })
        Object.values(puzzles_data).forEach(x => boxplot_data.push(calculateBoxplotParameter(x)))       
        category_data = Object.keys(puzzles_data).map(x => puzzles.find(y => y.id == x).name)
    } else {
        boxplot_data = [
            calculateBoxplotParameter(filterAttribute('time')),
            calculateBoxplotParameter(filterAttribute('edits')),
            calculateBoxplotParameter(filterAttribute('conciseness')),
            calculateBoxplotParameter(filterAttribute('complexity'))
        ]
        category_data = ['time', 'edits', 'conciseness', 'complexity']
    }
    
    return {
        bindto: '#boxplot_chart',
        data: {
            colors: {
                min: '#00E5FF',
                a1: '#00E5FF',
                a2: '#00E5FF',
                low: '#00E5FF',
                high: '#00E5FF',
                b1: '#00bfa5',
                b2: '#00bfa5',
                m: '#0E293C'
            },
            order: null,
            json: boxplot_data,
            keys: {
                value: ['min', 'low', 'a1', 'b1', 'm', 'b2', 'a2', 'high', 'median', 'max', 'iq1', 'iq3', 'iqr']
            },
            hide: ['median', 'max', 'iq1', 'iq3', 'iqr'],
            groups: [['min', 'low', 'a1', 'b1', 'm', 'b2', 'a2', 'high']],
            names: {
                a1: 'IQ1',
                b1: 'IQR',
                m: 'median',
                b2: 'IQ3',
                a2: 'max'
            },
            type: 'bar'
        },
        legend: {
            show: false
        },
        axis: {
            x: {
                type: 'category',
                categories: category_data
            }
        },

        tooltip: {
            format: {
                value: function (value, ratio, id, index) {
                    let names = {
                        min: 'min',
                        a1: 'iq1',
                        b1: 'iqr',
                        m: 'median',
                        b2: 'iq3',
                        a2: 'max'
                    }
                    return boxplot_data[index][names[id]]
                }
            }
        }
    }
}

function radar(best_score, user_score, user_flag = false, previous_flag = false) {
    function isOverLapped(score_1, score_2) {
        if (user_flag == 999) {
            for (let key in score_1) {
                if (score_1[key] != score_2[key])
                    return false
            }
            return true
        }
        else {
            if (score_1.score == score_2.score) {
                if (score_1.time == score_2.time) {
                    if (score_1.edits == score_2.edits) {
                        if (score_1.conciseness == score_2.conciseness) {
                            if (score_1.complexity == score_2.complexity)
                                return true
                        }
                    }
                }
            }
        }
        return false
    }
    function formatData(score, name) {
        let result = {
            name: name,
            axes: [],
        }
        if (user_flag == 999) {
            for (let key in score) {
                result.axes.push({
                    axis: key,
                    value: score[key]
                })
            }
        }
        else {
            result = {
                name: name,
                axes: [
                    { axis: 'complexity', value: 0 },
                    { axis: 'edits', value: 0 },
                    { axis: 'conciseness', value: 0 },
                    { axis: 'time', value: 0 }
                ],
            }
            if (score) {
                result.axes[0].value = score.complexity
                result.axes[1].value = score.edits
                result.axes[2].value = score.conciseness
                result.axes[3].value = score.time
            }
        }
        return result
    }

    let data = []
    let options = ['#219185']
    data[0] = formatData(best_score, 'Best Score')
    if (user_flag) {

        options[1] = '#40C4FF'
        data[1] = formatData(user_score, 'User Score')

        if (isOverLapped(user_score, best_score))
            options[0] = options[1]

        if (previous_flag) {
            data[2] = formatData(user_score.old_score, 'Previous Score')

            options = ['#ffffff', '#40c4ff', '#40c4ff']

            if (user_score.old_score.score > user_score.score) {
                options = ['#ffffff', '#d63c3c', '#c9c93a']
            }
            else if (user_score.old_score.score < user_score.score) {
                options = ['#ffffff', '#c9c93a', '#d63c3c']
            }

            if (isOverLapped(user_score, best_score)) {
                options[0] = options[1]
            }
            else if (isOverLapped(user_score.old_score, best_score)) {
                options[0] = options[2]
            }
        }
    }
    return {
        data,
        options,
        flags: {
            user: user_flag
        }
    }
}

function range(min, max, interval, user_score) {
    if (min == max) {
        min = 0
    }

    let range = []
    while (min <= max) {
        if (min > user_score && range.indexOf(user_score) < 0) {
            if (Math.abs(min - interval - user_score) <= Math.abs(user_score - min)) {
                range.pop()
                range.push(user_score)
            } else {
                range.push(user_score)
                min += interval
                range.push(min)
            }

        } else {
            range.push(min)
        }
        min += interval
    }
    if (range[range.length - 1] != max) {
        range.pop()
        range.push(max)
    }
    return range
}

function getNumberWithOrdinal(n) {
    var s = ["th", "st", "nd", "rd"],
        v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

let bell_data, json_data, user_score, result, names_data, colors_data, types_data, xs_data, format_data

function percentile(data, userSub, puzzles) {
    bell_data = {}, json_data = {}, user_score = {}, result = {}, names_data = {}, colors_data = {}, types_data = {}, xs_data = {}, format_data = {}
    function normalPDF(x, mu, std) {
        return Math.exp(-0.5 * Math.log(2 * Math.PI) -
            Math.log(std) - Math.pow(x - mu, 2) / (2 * std * std));
    }

    function getPQ(data, user_score) {
        let q = []

        data = data.sort(ascending)
        let min = data[0]
        let max = data[data.length - 1]

        q = range(min, max, 10, user_score)

        let mu = mean(data)
        let sigma = deviation(data)
        let p = []

        q.forEach((value) => {
            p.push(normalPDF(value, mu, sigma / 3))
        })

        return {
            p,
            q,
            mu,
            sigma
        }
    }

    if (puzzles) {
        data.forEach(
            (value) => {
                result[value.puzzleId] ? result[value.puzzleId].push(value.score) : result[value.puzzleId] = [value.score]
                if (value.userSub == userSub)
                    user_score[value.puzzleId] = value.score
            }
        )
    }
    else {
        data.forEach(
            (value) => {
                result['time'] ? result['time'].push(value.time) : result['time'] = [value.time]
                result['edits'] ? result['edits'].push(value.edits) : result['edits'] = [value.edits]
                result['conciseness'] ? result['conciseness'].push(value.conciseness) : result['conciseness'] = [value.conciseness]
                result['complexity'] ? result['complexity'].push(value.complexity) : result['complexity'] = [value.complexity]
                if (value.userSub == userSub)
                    user_score = value
            }
        )
    }

    let colors = ['#1f77b4', '#aec7e8', '#009688', '#98df8a', '#d62728', '#FF6F00']
    let color_index = 0
    for (let element in result) {
        xs_data[element] = 'x' + element
        bell_data[element] = getPQ(result[element], user_score[element])
        json_data['x' + element] = bell_data[element].q
        json_data[element] = bell_data[element].p

        colors_data['x' + element] = colors_data[element] = colors[color_index]

        if (puzzles) names_data[element] = puzzles.find(puzzle => puzzle.id == element).name

        if (user_score[element]) {
            json_data['b' + element] = user_score[element]
            json_data['bar' + element] = bell_data[element].p[bell_data[element].q.indexOf(user_score[element])]
            xs_data['bar' + element] = 'b' + element
            types_data['bar' + element] = 'bar'
            colors_data['bar' + element] = colors[color_index]
        }
        color_index++
    }

    format_data = {
        name: function (name, ratio, id, index) {
            if (id.startsWith('bar')) {
                return 'You'
            }
            return name
        },
        value: function (value, ratio, id, index) {
            if (id.startsWith('bar')) {
                let user_score = json_data[id.replace('bar', 'b')]
                let scores = json_data[id.replace('bar', 'x')]

                return getNumberWithOrdinal(Math.min(100, Math.round(((scores.indexOf(user_score) + 2) / scores.length) * 100))) + ' percentile'
            } else {
                return getNumberWithOrdinal(Math.min(100, Math.round(((index + 2) / json_data[id].length) * 100))) + ' percentile'
            }
        }
    }

    return {
        bindto: '#percentile_chart',
        data: {
            xs: xs_data,
            json: json_data,
            names: names_data,
            type: 'area-spline',
            types: types_data,
            colors: colors_data,
        },
        bar: {
            width: 1.5
        },
        spline: {
            interpolation: {
                type: 'basis'
            }
        },
        point: {
            show: false
        },
        axis: {
            x: {
                tick: {
                    count: 5,
                    culling: false,
                    format: x => Math.round(x)
                },
                label: {
                    text: 'Scores'
                },
            },
            y: {
                show: false
            }
        },
        tooltip: {
            format: format_data
        },
        padding: {
            left: 10,
            right: 10,
        },
    }
}

// This function depends on the percentile function firing first, changing the order will break it
function cdf() {

    function getCurve(data) {
        let cumsum = (sum => value => Math.min(0.999999999, sum += value * 10))(0)
        return data.p.map(cumsum)
    }

    let cdf_json_data = {}
    for (let element in result) {
        cdf_json_data['x' + element] = json_data['x' + element]
        cdf_json_data[element] = getCurve(bell_data[element])

        if (user_score[element]) {
            cdf_json_data['b' + element] = json_data['b' + element]
            cdf_json_data['bar' + element] = cdf_json_data[element][cdf_json_data['x' + element].indexOf(json_data['b' + element])]
        }
    }

    let cdf_types_data = {}
    Object.entries(types_data).forEach(x => {
        cdf_types_data[x[0]] = x[1].replace('area-', '')
    })

    return {
        bindto: '#cdf_chart',
        data: {
            xs: xs_data,
            json: cdf_json_data,
            names: names_data,
            type: 'spline',
            types: cdf_types_data,
            colors: colors_data,
        },
        bar: {
            width: 1.5
        },
        point: {
            show: false
        },
        spline: {
            interpolation: {
                type: 'basis'
            }
        },
        axis: {
            x: {
                tick: {
                    count: 5,
                    culling: false,
                    format: x => Math.round(x)
                },
                label: {
                    text: 'Scores'
                },
            },
            y: {
                label: {
                    text: 'Cumulative Distribution Function (CDF)'
                },
            }
        },
        tooltip: {
            format: format_data
        },
        padding: {
            right: 10,
        },
    }

}
export { donut, pie, stackedBar, axesRotated, areaStep, scatter, boxplot, radar, percentile, cdf }
