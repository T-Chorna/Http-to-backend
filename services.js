export async function sendGETRequest(url) {
    try {
        const response = await fetch(`${url}`);
        
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error(`Помилка при обробці запиту: ${response.statusText}`);
        }
    } catch (error) {
        throw new Error(`Помилка при відправці запиту: ${error.message}`);
    }
}

export async function sendPOSTRequest(url, body) {
    try {
        const response =await fetch(`${url}`, { 
                                  method: "POST", 
                                  headers: {'Content-Type': 'application/json'}, 
                                  body: JSON.stringify(body) 
                                });
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error(`Помилка при обробці запиту: ${response.statusText}`);
        }
    } catch (error) {
        throw new Error(`Помилка при відправці запиту: ${error.message}`);
    }
}

export async function sendPUTRequest(url, body) {
    try {
        const response =await fetch(`${url}`, { 
                                  method: "PUT", 
                                  headers: {'Content-Type': 'application/json'}, 
                                  body: JSON.stringify(body) 
                                });
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error(`Помилка при обробці запиту: ${response.statusText}`);
        }
    } catch (error) {
        throw new Error(`Помилка при відправці запиту: ${error.message}`);
    }
}

export async function sendDELETERequest(url) {
    try {
        const response =await fetch(`${url}`, { 
                                  method: "DELETE"
                                });
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error(`Помилка при обробці запиту: ${response.statusText}`);
        }
    } catch (error) {
        throw new Error(`Помилка при відправці запиту: ${error.message}`);
    }
}