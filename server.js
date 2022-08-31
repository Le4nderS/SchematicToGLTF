const fastify = require('fastify')();

fastify.register(require('@fastify/multipart'))
fastify.register(require('./routes/schematics'), { prefix: '/schematics' });


fastify.listen(3000, function (err, address) {
    if(err){
        console.log(err);
        process.exit(1);
    } else {
        console.log('Api läuft');
    }
});