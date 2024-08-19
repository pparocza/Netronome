function initializeMaxInputBindings()
{
    window.max.bindInlet('input_test', function (arg)
    {
        maxOutlet("INPUT HEARD!")
    });
    
    window.max.bindInlet(`socket_emit`, function (arg)
    {
        socket.emit('createNode');
        maxOutlet("emit sent!");
    });
}

initializeP5Instance();
initializeMaxInputBindings();

function maxOutlet(toMaxOutlet)
{
    window.max.outlet(toMaxOutlet);
}