from gql import gql, Client
from gql.transport.aiohttp import AIOHTTPTransport
import pprint
import json
pp = pprint.PrettyPrinter(indent=4)
# Select your transport with a defined url endpoint
transport = AIOHTTPTransport(url="https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2")

# Create a GraphQL client using the defined transport
client = Client(transport=transport, fetch_schema_from_transport=True)

# Provide a GraphQL query
query = gql(
    """
    query {
	    tokens(orderBy: tradeVolumeUSD, orderDirection: desc) {
            tradeVolumeUSD
            name
            mostLiquidPairs(orderBy: dailyVolumeUSD, orderDirection: desc) {
                id
            }
        }
    }
"""
)

queryTokens = gql(
    """
    query {
        tokens(first: 5, orderBy: tradeVolumeUSD, orderDirection: desc) {
            id
            symbol
            name
            decimals
        }
    }
    """
)

tokens = client.execute(queryTokens)
pp.pprint(tokens)
for token in tokens["tokens"]:
    query = gql(    
        """
            fragment TokenFields on Token {  
                id  
                name  
                symbol  
                derivedETH  
                tradeVolume 
                tradeVolumeUSD  
                untrackedVolumeUSD  
                totalLiquidity  
                txCount  
                __typename
            }
            query tokens {
                
                tokens(where: {id: "%s"}) {    
                    ...TokenFields    
                    __typename  
                }  
                pairs0: pairs(where: {token0: "%s"}, first: 10, orderBy: volumeUSD, orderDirection: desc) {
                    id
                    token0 {
                        name
                    }
                    token1 {
                        name
                    }
                    token0Price
                    token1Price
                    __typename
                }
                pairs1: pairs(where: {token1: "%s"}, first: 10, orderBy: volumeUSD, orderDirection: desc) {
                    id
                    token0 {
                        name
                    }
                    token1 {
                        name
                    }
                    token0Price
                    token1Price
                    __typename  
                }
            }
            

        """  % (token["id"], token["id"], token["id"])
    )
    pairs = client.execute(query)
    pp.pprint(pairs)

# pp.pprint({"data":{"pairs0":[{"__typename":"Pair","id":"0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852"},{"__typename":"Pair","id":"0xc5be99a02c6857f9eac67bbce58df5572498f40c"},{"__typename":"Pair","id":"0x23d15edceb5b5b3a23347fa425846de80a2e8e5c"},{"__typename":"Pair","id":"0x81fbef4704776cc5bba0a5df3a90056d2c6900b3"},{"__typename":"Pair","id":"0xff62e62e8b3cf80050464b86194e52c3ead43bb6"},{"__typename":"Pair","id":"0x84e34df6f8f85f15d24ec8e347d32f1184089a14"},{"__typename":"Pair","id":"0x33906431e44553411b8668543ffc20aaa24f75f9"},{"__typename":"Pair","id":"0xf49c43ae0faf37217bdcb00df478cf793edd6687"},{"__typename":"Pair","id":"0x75f89ffbe5c25161cbc7e97c988c9f391eaefaf9"},{"__typename":"Pair","id":"0x3da1313ae46132a397d90d95b1424a9a7e3e0fce"},{"__typename":"Pair","id":"0xd90a1ba0cbaaaabfdc6c814cdf1611306a26e1f8"},{"__typename":"Pair","id":"0x32d588fd4d0993378995306563a04af5fa162dec"},{"__typename":"Pair","id":"0x7cc34ea5d7103d01b76e0dccf1ddad9f376801e9"},{"__typename":"Pair","id":"0xc6f348dd3b91a56d117ec0071c1e9b83c0996de4"},{"__typename":"Pair","id":"0xf4ef707f3f4166cc79af15959014dbe0ecd7efa3"},{"__typename":"Pair","id":"0x8175362afbeee32afb22d05adc0bbd08de32f5ae"},{"__typename":"Pair","id":"0xe56c60b5f9f7b5fc70de0eb79c6ee7d00efa2625"},{"__typename":"Pair","id":"0x582e3da39948c6339433008703211ad2c13eb2ac"},{"__typename":"Pair","id":"0x48e313460dd00100e22230e56e0a87b394066844"},{"__typename":"Pair","id":"0xdfcc12a0aad50d84639d558551edd7a523b69ac5"},{"__typename":"Pair","id":"0x5dfbe95925ffeb68f7d17920be7b313289a1a583"},{"__typename":"Pair","id":"0xa2b04f8133fc25887a436812eae384e32a8a84f2"},{"__typename":"Pair","id":"0x70ec2fa6eccf4010eaf572d1c1a7bcbc72dec983"},{"__typename":"Pair","id":"0xaf21b0ec0197e63a5c6cc30c8e947eb8165c6212"},{"__typename":"Pair","id":"0xb490d7e49e599ca9d19d87a163ee166399ba4b4d"},{"__typename":"Pair","id":"0x01f8989c1e556f5c89c7d46786db98eeaae82c33"},{"__typename":"Pair","id":"0xf647830cbd601ea7b6a3c1b38cf037f31ab6ce79"},{"__typename":"Pair","id":"0xbe78353416003aa6e2c38e85249fdee3ce8c9b1b"},{"__typename":"Pair","id":"0xa89abe11bd3ef4cf68a5004ba99b9fda52d5e8fc"},{"__typename":"Pair","id":"0x0b85b3000bef3e26e01428d1b525a532ea7513b8"},{"__typename":"Pair","id":"0xa6cf904beb194cbe1b7a5300f6e3f2eebdd73b43"},{"__typename":"Pair","id":"0xb7864c708ad58af75c756c26b1ba155bfa0e2307"},{"__typename":"Pair","id":"0xa896f041a2b18e58e7fbc513cd371de1348596de"},{"__typename":"Pair","id":"0xe275eb6154cb4a73f0ba573e43b2b06e9e78b7f0"},{"__typename":"Pair","id":"0x27fd0857f0ef224097001e87e61026e39e1b04d1"},{"__typename":"Pair","id":"0x7d611e4cf1c7b94561c4caa5602f329d108336e3"},{"__typename":"Pair","id":"0xbc9d21652cca70f54351e3fb982c6b5dbe992a22"},{"__typename":"Pair","id":"0x0b316150f91dbd9a234b870cc75aaf57def1be43"},{"__typename":"Pair","id":"0x1b21609d42fa32f371f58df294ed25b2d2e5c8ba"},{"__typename":"Pair","id":"0xae2d4004241254aed3f93873604d39883c8259f0"},{"__typename":"Pair","id":"0x5428717b7baed889f2fd55cf4627ed256acd310b"},{"__typename":"Pair","id":"0x08650bb9dc722c9c8c62e79c2bafa2d3fc5b3293"},{"__typename":"Pair","id":"0x6a3d23fa07c455f88d70c29d230467c407a3964b"},{"__typename":"Pair","id":"0x61122b41600c59ef4248ff9818fbf0a1b43abe17"},{"__typename":"Pair","id":"0x816579230a4c61670eba15486c8357bf87ec307e"},{"__typename":"Pair","id":"0xca13c1f54c67a125ffdef3246650d0666f7ae2f1"},{"__typename":"Pair","id":"0xbe38a889d67467b665e30e20ee5604a6f5696e38"},{"__typename":"Pair","id":"0x9d4b552c992ee3b863f3b51e95e46ecf38c21429"},{"__typename":"Pair","id":"0x5916953296edf0996a0e77488b3af450095e2a35"},{"__typename":"Pair","id":"0x24b24af104c961da1ba5bccce4410d49aa558477"}],"pairs1":[{"__typename":"Pair","id":"0xbb2b8038a1640196fbe3e38816f3e67cba72d940"},{"__typename":"Pair","id":"0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc"},{"__typename":"Pair","id":"0xa478c2975ab1ea89e8196811f51a7b7ade33eb11"},{"__typename":"Pair","id":"0xd3d2e2692501a5c9ca623199d38826e513033a17"},{"__typename":"Pair","id":"0x4d5ef58aac27d99935e5b6b4a6778ff292059991"},{"__typename":"Pair","id":"0xa2107fa5b38d9bbd2c461d6edf11b11a50f6b974"},{"__typename":"Pair","id":"0x32ce7e48debdccbfe0cd037cc89526e4382cb81b"},{"__typename":"Pair","id":"0x2fdbadf3c4d5a8666bc06645b8358ab803996e28"},{"__typename":"Pair","id":"0x85609c626b532ca8bea6c36be53afdcb15dd4a48"},{"__typename":"Pair","id":"0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f"},{"__typename":"Pair","id":"0xdc98556ce24f007a5ef6dc1ce96322d65832a819"},{"__typename":"Pair","id":"0xec6a6b7db761a5c9910ba8fcab98116d384b1b85"},{"__typename":"Pair","id":"0xc2adda861f89bbb333c90c492cb837741916a225"},{"__typename":"Pair","id":"0xa5e79baee540f000ef6f23d067cd3ac22c7d9fe6"},{"__typename":"Pair","id":"0x43ae24960e5534731fc831386c07755a2dc33d47"},{"__typename":"Pair","id":"0xc3fa0a8d68a43ed336174cb5673903572bbace8e"},{"__typename":"Pair","id":"0x55d5c232d921b9eaa6b37b5845e439acd04b4dba"},{"__typename":"Pair","id":"0x8bd1661da98ebdd3bd080f0be4e6d9be8ce9858c"},{"__typename":"Pair","id":"0x4d96369002fc5b9687ee924d458a7e5baa5df34e"},{"__typename":"Pair","id":"0x6c8b0dee9e90ea9f790da5daf6f5b20d23b39689"},{"__typename":"Pair","id":"0x30ee4e8e49d81312b93f41778f6446827a080ade"},{"__typename":"Pair","id":"0x12d4444f96c644385d8ab355f6ddf801315b6254"},{"__typename":"Pair","id":"0x1d6432aefeae2c0ff1393120541863822a4e6fa7"},{"__typename":"Pair","id":"0xcffdded873554f362ac02f8fb1f02e5ada10516f"},{"__typename":"Pair","id":"0xc76225124f3caab07f609b1d147a31de43926cd6"},{"__typename":"Pair","id":"0x1107b6081231d7f256269ad014bf92e041cb08df"},{"__typename":"Pair","id":"0x3b3d4eefdc603b232907a7f3d0ed1eea5c62b5f7"},{"__typename":"Pair","id":"0x9b7dad79fc16106b47a3dab791f389c167e15eb0"},{"__typename":"Pair","id":"0x87febfb3ac5791034fd5ef1a615e9d9627c2665d"},{"__typename":"Pair","id":"0xf66369997ae562bc9eec2ab9541581252f9ca383"},{"__typename":"Pair","id":"0x0d0d65e7a7db277d3e0f5e1676325e75f3340455"},{"__typename":"Pair","id":"0xba65016890709dbc9491ca7bf5de395b8441dc8b"},{"__typename":"Pair","id":"0xb6909b960dbbe7392d405429eb2b3649752b4838"},{"__typename":"Pair","id":"0x343fd171caf4f0287ae6b87d75a8964dc44516ab"},{"__typename":"Pair","id":"0x4dc02e1bb2ec1ce4c50c351e6e06505e7b1dce8d"},{"__typename":"Pair","id":"0xf80758ab42c3b07da84053fd88804bcb6baa4b5c"},{"__typename":"Pair","id":"0xe0cc5afc0ff2c76183416fb8d1a29f6799fb2cdf"},{"__typename":"Pair","id":"0xb58645ac31c5c40f03ea4cc44885ffeff1d74851"},{"__typename":"Pair","id":"0x441f9e2c89a343cefb390a8954b3b562f8f91eca"},{"__typename":"Pair","id":"0x3dd49f67e9d5bc4c5e6634b3f70bfd9dc1b6bd74"},{"__typename":"Pair","id":"0xb6c8e5f00117136571d260bfb1baff62ddfd9960"},{"__typename":"Pair","id":"0x01962144d41415cca072900fe87bbe2992a99f10"},{"__typename":"Pair","id":"0xccdcbdf3ebd11cce6a55b477b1427c0a4e0e2829"},{"__typename":"Pair","id":"0x88d97d199b9ed37c29d846d00d443de980832a22"},{"__typename":"Pair","id":"0xc822d85d2dcedfaf2cefcf69dbd5588e7ffc9f10"},{"__typename":"Pair","id":"0x5cd556e3572196b39ba86fb1cc5f584f0e8f40d3"},{"__typename":"Pair","id":"0x2caccf71bdf8fff97c06a46eca29b611b1a74b5e"},{"__typename":"Pair","id":"0x70ea56e46266f0137bac6b75710e3546f47c855d"},{"__typename":"Pair","id":"0xb27de0ba2abfbfdf15667a939f041b52118af5ba"},{"__typename":"Pair","id":"0x7fe6f7b4541ef4d40801e9b749f8d005af985a3f"}],"tokens":[{"__typename":"Token","derivedETH":"1","id":"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","name":"Wrapped Ether","symbol":"WETH","totalLiquidity":"1211254.158274230699426599","tradeVolume":"104647848.462697837566887425","tradeVolumeUSD":"37427685660.95947231709934471107468","txCount":"17447510","untrackedVolumeUSD":"75297819603.02106915354390541315728"}]}})
# _or: [
#     {date: 1606521600, token0: {
#         id: "%s"
#     }},
#     {date: 1606521600, token1: {
#         id: "%s"
#     }}
# ]