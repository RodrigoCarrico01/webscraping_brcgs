const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');

async function run() {
    try {
        console.log('Iniciando o processo...');

        const browser = await puppeteer.launch({ timeout: 60000});
        console.log('Browser iniciado.');

        const page = await browser.newPage();
        console.log('Nova página criada.');

        await page.goto('https://directory.brcgs.com');
        console.log('Página inicial carregada.');

        // Encontrar o elemento de entrada e o botão de pesquisa
        const searchInput = await page.$('.SearchBox_searchTextField__3oaI3 input');
        const searchButton = await page.$('.SearchBox_searchTextField__3oaI3 button');

        if (!searchInput || !searchButton) {
            throw new Error('Não foi possível encontrar o campo de pesquisa ou o botão de pesquisa.');
        }

        console.log('Campo de pesquisa e botão de pesquisa encontrados.');

        // Inserir "Portugal" no campo de pesquisa
        await searchInput.type('Portugal');
        console.log('Texto inserido no campo de pesquisa.');

        // Clicar no botão de pesquisa
        await searchButton.click();
        console.log('Botão de pesquisa clicado.');

        let companies = [];

        // Loop para percorrer todas as páginas
        while (true) {
            console.log('Aguardando pelos resultados da pesquisa...');

            // Esperar pelos resultados da pesquisa
            await page.waitForSelector('.PublicDirectory_content__3fGhp .SiteCard_siteCard__3sfdX');

            console.log('Resultados da pesquisa encontrados.');

            // Extrair os botões de detalhes da página atual
            const detailButtons = await page.$$('.SiteCard_siteCard__3sfdX .MuiTouchRipple-root');

            // Verificar se há botões de detalhes
            if (detailButtons.length === 0) {
                console.log('Não há botões de detalhes na página atual.');
                break; // Saia do loop se não houver botões de detalhes
            }

            // Iterar sobre os botões de detalhes e clicar em cada um
            for (let i = 0; i < detailButtons.length; i++) {
                // Esperar um curto período para evitar erros de clique muito rápidos
                await new Promise(resolve => setTimeout(resolve, 500)); // Aguardar 0.5 segundo

                // Recuperar novamente os botões de detalhes após a espera
                const updatedDetailButtons = await page.$$('.SiteCard_siteCard__3sfdX .MuiTouchRipple-root');

                // Clicar no botão de detalhes correspondente ao índice atual
                await updatedDetailButtons[i].click();
                console.log('Botão de detalhes clicado.');

                // Aguardar um tempo para o conteúdo carregar
                await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar 0.5 segundo

                // Extrair informações da empresa da página de detalhes
                const details = await page.evaluate(() => {
                    const companyDetails = {};
                    const infoBoxElements = document.querySelectorAll('.InfoBox_infoBox__1JkXW');

                    // Extrair nome da empresa
                    const companyName = document.querySelector('.PageHeaderMenu_pageHeader__wGA7j h1');
                    const name = companyName ? companyName.innerText.trim() : '';
                    companyDetails['Nome'] = name; // Adiciona o nome da empresa

                    for (const infoBox of infoBoxElements) {
                        const title = infoBox.querySelector('.Box_titleRow__3yyic h2.header').innerText;
                        const entries = infoBox.querySelectorAll('.InfoBox_entryPair__1q-c8');

                        companyDetails[title] = {};

                        for (const entry of entries) {
                            const label = entry.querySelector('.header').innerText;
                            const value = entry.innerText.replace(label, '').trim();
                            companyDetails[title][label] = value;
                        }
                    }

                    return companyDetails;
                });

                // Verificar se o standard é "food" antes de adicionar os detalhes da empresa ao array
                if (details['Certification Details'] && details['Certification Details']['Standard'] === 'Food') {
                    console.log('Informações detalhadas da empresa extraídas:', details);

                    // Adicionar detalhes da empresa ao array
                    companies.push({
                        name: details.Nome,
                        details: details
                    });

                    console.log('Dados da empresa extraídos.');
                } else {
                    console.log('A empresa não possui padrão de certificação "food". Ignorando...');
                }

                // Verificar se o botão de volta está presente antes de clicar nele
                const backButton = await page.$('.BackButton_backButton__2BZ07');
                if (backButton) {
                    await backButton.click();
                    console.log('Botão de volta clicado.');

                    // Aguardar um tempo para garantir que a página de resultados seja carregada novamente
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar 0.5 segundo
                }
            }

            // Verificar se há mais páginas disponíveis
            const nextPageButton = await page.$('.MuiButtonBase-root.MuiPaginationItem-root.MuiPaginationItem-page.MuiPaginationItem-outlined.MuiPaginationItem-outlinedPrimary[aria-label="Go to next page"]');
            const isDisabled = await nextPageButton.evaluate(node => node.hasAttribute('disabled'));
            if (nextPageButton && !isDisabled) {
                // Clicar no botão de próxima página
                await nextPageButton.click();
                console.log('Próxima página carregada.');

                // Esperar um curto período para garantir que a próxima página seja carregada
                await new Promise(resolve => setTimeout(resolve, 5000)); // Aguardar 0.5 segundo

                console.log('Espera para próxima página concluída.');
            } else {
                console.log('Não há mais páginas disponíveis. Saindo do loop.');
                break;
            }
        }

        // Salvar os dados das empresas em um arquivo Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Empresas');

         // Adicionar cabeçalhos
         worksheet.addRow([
            'Nome', 
            'Site code', 
            'Address', 
            'Telephone', 
            'Email', 
            'Technical Contact Name', 
            'Technical Contact Email', 
            'Commercial Contact Name', 
            'Commercial Contact Email', 
            'Standard', 
            'Category', 
            'Scope', 
            'Certification Body', 
            'Exclusion', 
            'Grade', 
            'Issue Date', 
            'Expiry Date', 
            'Audit Programme'
        ]);

        // Adicionar dados das empresas ao arquivo Excel
        companies.forEach(company => {
            const rowData = [
                company.name,
                company.details['Details']['Site code'],
                company.details['Details']['Address'],
                company.details['Details']['Telephone'],
                company.details['Details']['Email'],
                company.details['Technical Contact']['Name'],
                company.details['Technical Contact']['Email'],
                company.details['Commercial Contact']['Name'],
                company.details['Commercial Contact']['Email'],
                company.details['Certification Details']['Standard'],
                company.details['Certification Details']['Category'],
                company.details['Certification Details']['Scope'],
                company.details['Certification Details']['Certification Body'],
                company.details['Certification Details']['Exclusion'],
                company.details['Certification Details']['Grade'],
                company.details['Certification Details']['Issue Date'],
                company.details['Certification Details']['Expiry Date'],
                company.details['Certification Details']['Audit Programme']
            ];
            worksheet.addRow(rowData);
        });
        
        await workbook.xlsx.writeFile('empresas.xlsx');
        console.log('Arquivo Excel salvo com sucesso: empresas.xlsx');

        // Fechar o navegador e concluir o processo
        await browser.close();
        console.log('Navegador fechado. Processo concluído.');
    } catch (error) {
        console.error('Ocorreu um erro:', error);
    }
}

run();
