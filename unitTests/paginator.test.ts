import { HaikuPaginator } from '../dist/index.js';
import { MessageEmbed } from 'discord.js';

test('iterates through all embeds', () => {
    let p = new HaikuPaginator(new MessageEmbed());
    for(let i = 0; i < 1000; i++) {
        p.addDescriptionContent('test');
    }
    let pages = Array.from(p.getIterator());
    console.log(pages[0])
    expect(pages.length).toBe(3);
});

test('checks the length of description doesn\'t exceed maxDescriptionLength', () => {
    let p = new HaikuPaginator(new MessageEmbed());
    for(let i = 0; i < 100; i++) p.addDescriptionContent('test');
    let pages = [...p.getIterator()];
    for(let page of pages) {
        expect(page.description.length <= p.maxDescriptionLength).toBe(true);
    }
})

test('checks the length of fields doesn\'t exceed maxFields', () => {
    let p = new HaikuPaginator(new MessageEmbed());
    for(let i = 0; i < 100; i++) p.addField('test', i.toString());
    let pages = [...p.getIterator()];
    for(let page of pages) {
        
        expect(page.fields.length <= p.maxFields).toBe(true);
    }
})

test('clears the memo when the description is reset', () => {
   let paginator = new HaikuPaginator(new MessageEmbed());
   paginator.setDescription('test'); 
   paginator.getEmbed(0);
   paginator.setDescription('test');
   expect(paginator._descriptionStartEndMemo).toBe({});
});

test('applies the attributes of the provied embed to the new embeds', () => {
    let embed = new MessageEmbed();
    embed.setTitle('An embed');
    let paginator = new HaikuPaginator(embed);
    paginator.addDescriptionContent('test');

    expect(paginator.getEmbed(0).title).toBe('An embed');
    expect(paginator.getEmbed(0).description).toBe('test');
});

test('gets the correct description for strings where it splits on spaces', () => {
    let paginator = new HaikuPaginator(new MessageEmbed(), {maxDescriptionLength: 10});
    paginator.setDescription('a sentence that is quite annoying for paginating!');
    let pages = [...paginator.getIterator()];

    let expected = ["a sentence", "that is", "quite", "annoying", "for", "paginating", "!"];
    
    for(let page of pages) {
        expect(page.description).toBe(expected.shift());
    }
    
});