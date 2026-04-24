<script lang="ts">
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { t } from '$lib/stores/lang.svelte';
</script>

<svelte:head>
	<title>{t({ en: 'About — AI Research Tutorials', ja: 'About — AI リサーチチュートリアル' })}</title>
</svelte:head>

<Nav />

<main class="about">
	<div class="about__inner">
		<h1 class="about__title">{t({ en: 'About', ja: 'About' })}</h1>

		<div class="about__content">
			<p>
				{t({
					en: 'Teaching AI coding requires new tools to show how high-level instructions create content. With our webpage we break that communication barrier with terminal-to-content style tutorials.',
					ja: 'AI コーディングの教育には、高レベルの指示がどのようにコンテンツを生み出すかを示す新しいツールが必要です。このウェブページでは、ターミナルからコンテンツへのスタイルのチュートリアルで、そのコミュニケーションの壁を打ち破ります。'
				})}
			</p>
			<p>
				{t({
					en: 'The tutorials aim to cover areas like bioimage analysis, data analysis, mathematical modelling, and scientific coding.',
					ja: 'チュートリアルはバイオイメージ解析、データ解析、数理モデリング、科学計算などの分野をカバーすることを目指しています。'
				})}
			</p>
			<p>
				{t({ en: 'Created by ', ja: '作成: ' })}<a
					href="https://steffenpl.github.io"
					target="_blank"
					rel="noopener noreferrer">Steffen Plunder</a>{t({
					en: ' with Claude · ASHBi, Kyoto University.',
					ja: ' と Claude · 京都大学 ASHBi'
				})}
			</p>
			<p>
				{t({
					en: 'Want to contribute tutorials? PRs are welcome on ',
					ja: 'チュートリアルを寄稿しませんか？PR を歓迎します: '
				})}<a
					href="https://github.com/steffenpl/ai-research-tutorials"
					target="_blank"
					rel="noopener noreferrer">GitHub</a>.
			</p>
		</div>
	</div>
</main>

<Footer />

<style>
	.about {
		padding: 100px 24px 80px;
		min-height: 80vh;
	}

	.about__inner {
		max-width: 680px;
		margin: 0 auto;
	}

	.about__title {
		font-family: var(--font-display);
		font-size: clamp(1.8rem, 4vw, 2.4rem);
		font-weight: 700;
		color: var(--text-primary);
		margin-bottom: 32px;
		letter-spacing: -0.02em;
	}

	.about__content {
		font-size: 1rem;
		line-height: 1.75;
		color: var(--text-secondary);
	}

	.about__content p {
		margin-bottom: 16px;
	}

	.about__content ul {
		margin: 0 0 16px 24px;
		list-style: none;
	}

	.about__content li {
		position: relative;
		padding-left: 16px;
		margin-bottom: 8px;
	}

	.about__content li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 10px;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--accent);
		opacity: 0.6;
	}

	@media (max-width: 640px) {
		.about {
			padding: 80px 16px 64px;
		}
	}
</style>
