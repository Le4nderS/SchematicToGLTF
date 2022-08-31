const http = require('http');
fs = require('fs');
const download = require('download');
const { exec } = require('child_process');
const obj2gltf = require("obj2gltf");
const path = require('path');

const gltfPipeline = require("gltf-pipeline");
const fsExtra = require("fs-extra");


async function routes (fastify, options) {


    fastify.get('/:name', async (req, res) => {



        res.send("Started conversion");


        const file = 'https://www.dropbox.com/s/bkg6d9lyec2rcfj/RegensburgerDom1.schematic?dl=0';
        const filePath = `./ressources/tmp/schematics/`;
        const schemName = "BrandenburgerTor";

        var dir = [`./ressources/`,`./ressources/tmp/`,`./ressources/tmp/schematics/`,`./ressources/tmp/obj/`,`./ressources/tmp/obj/${schemName}`,`./ressources/tmp/gltf/`,`./ressources/finished/`];
        for (var i = 0; i < dir.length; i++) {
            if (!fs.existsSync(dir[i])){
                fs.mkdirSync(dir[i], { recursive: true });
                console.log("Folder "+dir[i]+" created")
            }
        }

        const mwscript = `Minecraft world: C:/Users/Leander/WebstormProjects/schemtoobjapi/ressources/tmp/schematics/${schemName}.schematic\n` +
            "Set render type: Wavefront OBJ absolute indices\n" +
            "Use biomes: no\n" +
            "Selection location: all\n" +
            `Export for rendering: C:/Users/Leander/WebstormProjects/schemtoobjapi/ressources/tmp/obj/${schemName}/${schemName}.obj\n` +
            "Close";

        fs.writeFileSync('./ressources/tmp/schematicToObj.mwscript', mwscript);
        console.log("Temporary Mineways-Script created")

        console.log("Download started")
        download(file,filePath)
            .then(() => {
                console.log('Download Completed');

                console.log('Mineways started');
                exec(`mineways.exe -m C:\\Users\\Leander\\WebstormProjects\\schemtoobjapi\\ressources\\tmp\\schematicToObj.mwscript`, (err, stdout, stderr) => {
                    if (err) {
                        console.log(err)
                        return;
                    }
                    console.log("SchematicToOBJ (Mineways) Completed")

                    obj2gltf(`./ressources/tmp/obj/${schemName}/${schemName}.obj`).then(function (gltf) {
                        const data = Buffer.from(JSON.stringify(gltf));
                        fs.writeFileSync(`./ressources/tmp/gltf/${schemName}.gltf`, data);
                        console.log("OBJToGLTF Completed")

                        const processGltf = gltfPipeline.processGltf;
                        const gltfe = fsExtra.readJsonSync(`./ressources/tmp/gltf/${schemName}.gltf`);
                        const options = {
                            dracoOptions: {
                                compressionLevel: 10,
                            },
                        };
                        processGltf(gltfe, options).then(function (results) {
                            fsExtra.writeJsonSync(`./ressources/finished/${schemName}-draco.gltf`, results.gltf);
                            console.log("GLTF-Draco compression Completed")


                            const directory = './ressources/tmp';

                         /*   fs.readdir(directory, (err, files) => {
                                if (err) throw err;

                                for (const file of files) {
                                    fs.unlink(path.join(directory, file), err => {
                                        if (err) throw err;
                                    });
                                }
                            });*/
                        });

                    });



                })
            })

    });

};

module.exports = routes;