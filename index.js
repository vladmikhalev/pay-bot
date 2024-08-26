require("dotenv").config();
const {Bot, GrammyError, HttpError, Keyboard, InlineKeyboard, InputFile} = require("grammy");
const {hydrate} = require("@grammyjs/hydrate");

const bot = new Bot(process.env.BOT_API_KEY);
bot.use(hydrate());

bot.api.setMyCommands([
	{
		command: "start",
		description: "запуск бота",
	},
	{
		command: "say_hello",
		description: "Получить приветствие",
	},
	{
		command: "menu",
		description: "Получить меню",
	},
	{
		command: "faq",
		description: "Ответы на вопросы",
	},
	{
		command: "help",
		description: "Помощь",
	},
	{
		command: "id",
		description: "Узнать свой id",
	},
	{
		command: "mood",
		description: "Узнать настроение",
	},
	{
		command: "share",
		description: "Поделиться",
	},
	{
		command: "inline_keyboard",
		description: "Инлайн клавиатура",
	},
]);

bot.command("start", async ctx => {
	await ctx.reply("Привет, я бот самого лучшего преподавателя английского языка. Быстрее записывайтесь на индивидуальные и групповые уроки к <a href='https://t.me/juliaamikhaleva'><b>Julia Mikhaleva</b></a>", {
		// reply_parameters: {message_id: ctx.msg.message_id}
		parse_mode: "HTML",
		disable_web_page_preview: true,
		// parse_mode: "MarkdownV2",
	});

	await ctx.replyWithAnimation(new InputFile("./media/shrek-reaction.mp4"));
});

const menuKeyboard = new InlineKeyboard()
.pay('Оплатить')
  // .text("Узнать статус заказ", "order-status")
  // .text("Обратиться в поддержку", "support")
  ;

const backKeyboard = new InlineKeyboard()
  .text("< Назад в меню", "back");

bot.command("menu", async ctx => {
	await ctx.reply("Выберите пункт меню", {
		reply_markup: menuKeyboard,
	});
});

bot.callbackQuery("order-status", async ctx => {
	await ctx.callbackQuery.message.editText("Статус заказа в пути", {
		reply_markup: backKeyboard,
	});
	await ctx.answerCallbackQuery();
});

bot.callbackQuery("support", async ctx => {
	await ctx.callbackQuery.message.editText("Напишите ваш вопрос", {
		reply_markup: backKeyboard,
	});
	await ctx.answerCallbackQuery();
});

bot.callbackQuery("back", async ctx => {
	await ctx.callbackQuery.message.editText("Выберите пункт меню", {
		reply_markup: menuKeyboard,
	});
	await ctx.answerCallbackQuery();
});


bot.hears("Хорошо 👍", async ctx => {
	await ctx.reply("Класс!!", {
		reply_markup: {
			remove_keyboard: true,
		},
	});
});

// инлайн клавиатура
bot.command("inline_keyboard", async ctx => {
	const inlineKeyboard = new InlineKeyboard().text("1", "button-1").row().text("2", "button-2").row().text("3", "button-3").row().url("Перейти в тг канал", "https://t.me/juliaamikhaleva");

	// const inlineKeyboard2 = new InlineKeyboard().url("Перейти в тг канал", "https://t.me/juliaamikhaleva");

	await ctx.reply("Нажмите кнопку", {
		reply_markup: inlineKeyboard,
	});
});

bot.callbackQuery(/button-[1-3]/, async ctx => {
	// console.log(ctx.update.callback_query.data)
	await ctx.answerCallbackQuery("Вы выбрали цифру!");
	await ctx.reply(`Вы выбрали кнопку: ${ctx.update.callback_query.data}`);
});
// bot.on("callback_query:data", async ctx => {
// 	  await ctx.answerCallbackQuery();
// 	  await ctx.reply(`Вы выбрали цифру: ${ctx.callbackQuery.data}`)
// })

bot.command("mood", async ctx => {
	// const moodKeyboard = new Keyboard()
	//   .text("Хорошо 👍")
	//   .row()
	//   .text("Норм")
	//   .row()
	//   .text("Не очень")
	//   .row()
	//   .text("Плохо")
	//   .resized();

	const moodLabels = ["Хорошо 👍", "Норм", "Не очень", "Плохо"];
	const rows = moodLabels.map(label => {
		return [Keyboard.text(label)];
	});
	const moodKeyboard2 = Keyboard.from(rows).resized();

	await ctx.reply("Как настроение?", {
		reply_markup: moodKeyboard2,
	});
});

bot.command("share", async ctx => {
	const shareKeyboard = new Keyboard().requestLocation("Геолокация").requestContact("Контакт").requestPoll("Опрос").placeholder("Укажи данные...").resized();

	await ctx.reply("Чем хочешь поделиться?", {
		reply_markup: shareKeyboard,
	});
});

bot.on(":contact", async ctx => {
	await ctx.reply("Спасибо!");
});

bot.command("id", async ctx => {
	await ctx.reply(`Ваш ID: ${ctx.from.id}`);
});

bot.command("say_hello", async ctx => {
	await ctx.react("👀");
	await ctx.reply("*_Hello_*", {
		parse_mode: "MarkdownV2",
	});
});

bot.command("faq", async ctx => {
	await ctx.reply("Здесь будут ответы на часто задаваемые вопросы");
});

bot.command("help", async ctx => {
	await ctx.reply("Скоро будет раздел с помощью");
});

bot.hears(/пипец/, async ctx => {
	await ctx.reply("Ругаться не красиво");
});

bot.on("message:entities:url", async ctx => {
	await ctx.reply("В этом сообщение есть url");
});

// bot.on("message").filter(
//   ctx => {
// 		return ctx.from.id === 520129533;
// 	},
// 	async ctx => {
// 		await ctx.reply("Привет админ");
// 	}
// );
// bot.on("message", async (ctx) => {
// 	await ctx.reply("В разработке...");
// });

bot.catch(err => {
	const ctx = err.ctx;
	console.error(`Error while handing update ${ctx.update.update_id}:`);
	const e = err.error;
	if (e instanceof GrammyError) {
		console.error("Error in request:", e.description);
	} else if (e instanceof HttpError) {
		console.error("Could not contact Telegram:", e);
	} else {
		console.error("Unknown error:", e);
	}
});

bot.start();
