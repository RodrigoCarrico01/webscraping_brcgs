# Português

## Web Scraping de Empresas Certificadas com Puppeteer e ExcelJS

Este projeto foi desenvolvido em **abril de 2024**, mas só agora decidi partilhá-lo no GitHub, pois estou a implementar melhores hábitos no uso desta plataforma. O código utiliza **Puppeteer** para automatizar a navegação e extração de dados do site [BRCGS Directory](https://directory.brcgs.com), e **ExcelJS** para exportar os dados extraídos para um ficheiro Excel.

###  Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript no lado do servidor.
- **Puppeteer**: Biblioteca para controlo do Google Chrome/Chromium via DevTools Protocol.
- **ExcelJS**: Biblioteca para manipulação de ficheiros Excel (.xlsx).

###  Funcionalidades do Código

- Acessa o site [BRCGS Directory](https://directory.brcgs.com) e pesquisa por empresas em "Portugal".
- Extrai informações detalhadas de empresas certificadas com o padrão **"Food"**, incluindo nome, contactos técnicos e comerciais, endereço, categoria de certificação, e outras informações.
- Exporta os dados extraídos para um ficheiro Excel chamado **`empresas.xlsx`**.

### 📂 Estrutura dos Dados no Excel

O ficheiro Excel gerado contém as seguintes colunas:

1. Nome  
2. Site code  
3. Address  
4. Telephone  
5. Email  
6. Technical Contact Name  
7. Technical Contact Email  
8. Commercial Contact Name  
9. Commercial Contact Email  
10. Standard  
11. Category  
12. Scope  
13. Certification Body  
14. Exclusion  
15. Grade  
16. Issue Date  
17. Expiry Date  
18. Audit Programme  

### ⚙️ Como Executar o Código

#### Pré-requisitos
- **Node.js** instalado no seu sistema.
- Um editor de código (por exemplo, Visual Studio Code).

#### Passos para execução
1. Clone este repositório:
   ```git clone <link-do-repositorio>```
   ```cd <nome-da-pasta>```
   
2. Instale as dependências:
   ```npm install```

3. Execute o script:
   ```node start```

4. Após a execução, o ficheiro `empresas.xlsx` será gerado na pasta raiz do projeto.

*Se estiver interessado em contribuir ou discutir melhorias, entre em contacto!*


