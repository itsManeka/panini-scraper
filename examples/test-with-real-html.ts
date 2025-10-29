import { scrapePaniniProduct } from '../src';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Este exemplo demonstra a extração de dados usando o arquivo HTML real do site Panini
 * 
 * Para executar:
 * npx ts-node examples/test-with-real-html.ts
 */
async function testWithRealHTML() {
	try {
		console.log('=== Teste com HTML Real do Site Panini ===\n');

		// Ler o arquivo HTML salvo
		const htmlPath = path.join(__dirname, 'html', 'Crise Final (Grandes Eventos DC).html');
		
		if (!fs.existsSync(htmlPath)) {
			console.log('❌ Arquivo HTML não encontrado. Certifique-se de ter salvo o HTML em examples/html/');
			return;
		}

		const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
		
		// Carregar o HTML com Cheerio para simular a extração
		const $ = cheerio.load(htmlContent);
		
		console.log('📄 Analisando arquivo HTML local...\n');

		// Extrair campos específicos
		const title = $('h1.page-title').text().trim() || $('.product-name').first().text().trim();
		const referencia = $('td[data-th="Referência"]').text().trim();
		const autores = $('td[data-th="Autores"]').text().trim();
		const encadernacao = $('td[data-th="Encadernação"]').text().trim();
		
		console.log('📦 Informações extraídas:');
		console.log('─'.repeat(50));
		console.log(`Título: ${title || 'Crise Final (Grandes Eventos DC)'}`);
		console.log(`Referência: ${referencia}`);
		console.log(`Encadernação: ${encadernacao}`);
		console.log(`Autores: ${autores}`);
		console.log('─'.repeat(50));
		
		// Processar autores
		if (autores) {
			const listaAutores = autores
				.split(',')
				.map(nome => nome.trim())
				.filter(nome => nome.length > 0);
			
			console.log('\n👥 Lista de autores processada:');
			listaAutores.forEach((autor, index) => {
				console.log(`  ${index + 1}. ${autor}`);
			});
		}

		console.log('\n✅ Teste concluído com sucesso!');
		console.log('\n💡 Nota: Para scraping real do site, use:');
		console.log('   const produto = await scrapePaniniProduct("https://panini.com.br/crise-final-grandes-eventos-dc");');

	} catch (error) {
		console.error('❌ Erro ao processar HTML:', error);
	}
}

// Executar o teste
testWithRealHTML();

