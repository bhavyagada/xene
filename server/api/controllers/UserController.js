import axios from 'axios'

const { User, UserPuzzles } = require('../../sequelize')

function getUserFromAuth0(token) {
    // console.log(token);
    return axios({
        method: 'get',
        url: 'http://' + process.env.AUTH0_DOMAIN + '/userinfo',
        data: {},
        headers: {
            'Authorization': token
        }
    })
        .then(user => {
            return user.data;
        })
        .catch(err => { });
}

exports.getUserFromAuth0 = getUserFromAuth0;

exports.getLoggedInUser = function (req, res) {
    let token = req.cookies['auth._token.auth0'];
    if (token) {
        getUserFromAuth0(token)
            .then(user => res.json(user))
            .catch(err => { });
    } else {
        res.json('Guest User')
    }
};

exports.setLoggedInUser = function (req, res) {
    if (req.body.sub) {
        User.findOrCreate({ where: { sub: req.body.sub }, defaults: { sub: req.body.sub } })
            .then((user) => res.json('User saved'))
            .catch(err => console.log(err));

    } else {
        res.json('Guest User')
    }
}

exports.getDistinctUsers = function (req, res) {
    UserPuzzles.aggregate('userSub', 'DISTINCT', { plain: false })
        .then(distinctSubs => {
            res.json(distinctSubs.map(v => v.DISTINCT))
        })
        .catch(err => console.log(err))
}

exports.fetchUsersFromAuth0 = async function (distinctSubs) {
    const params = {
        grant_type: 'client_credentials',
        client_id: process.env.AUTH0_API_CLIENT_ID,
        client_secret: process.env.AUTH0_API_CLIENT_SECRET,
        audience: 'https://' + process.env.AUTH0_DOMAIN + '/api/v2/'
    };

    const data = Object.entries(params)
        .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
        .join('&');

    return await axios({
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data,
        url: 'https://' + process.env.AUTH0_DOMAIN + '/oauth/token/'
    })
        .then(async token => {
            let payload = {
                search_engine: 'v3',
                fields: 'user_id,email,name,nickname,picture',
                per_page: '100',
                // include_totals: true,
                q: distinctSubs.join(' OR '),
            };

            let qs = Object.entries(payload)
                .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
                .join('&');

            return await axios({
                method: 'get',
                url: 'http://' + process.env.AUTH0_DOMAIN + '/api/v2/users?' + qs,
                headers: {
                    'Authorization': 'Bearer ' + token.data.access_token
                }
            })
                .then(users => {
                    return users.data.map(function (obj) {
                        obj['sub'] = obj['user_id'];
                        delete obj['user_id'];
                        return obj;
                    })
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
}