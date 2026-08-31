import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dns.promises
    .resolveSrv("_mongodb._tcp.cluster0.qt1r1ol.mongodb.net")
    .then((result) => {
        console.log("DNS works:");
        console.log(result);
    })
    .catch((error) => {
        console.error("DNS failed:");
        console.error(error);
    });