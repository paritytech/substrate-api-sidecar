// async function fetchBlocks() {
//   for (let i = 0; i < 22675231; i = i + 5000) {
//     console.log(i);
//     let res = await fetch(`http://127.0.0.1:8080/blocks/${i}`);
//     console.log(res.json());
//     console.log('done');
//     }
// }

// fetchBlocks();

(async () => {
    for (let i = 1; i < 22675231; i = i + 5000) {
        console.log(i);
        let res = await new Promise(async (res, rej) => {
            try {
                let response = await fetch(`http://127.0.0.1:8080/blocks/${i}`);
                if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`);
                }
              
                const json = await response.json();

                res(json);

            } catch (error) {
                rej(error);
            }
        });
        console.log('done', res.number);
    }
})()